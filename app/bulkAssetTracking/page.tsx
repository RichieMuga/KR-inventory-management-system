"use client";
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Component imports
import BulkSearchBar from "@/components/tracking/bulk-assets/search-bar"
import BulkAssetsTable from "@/components/tracking/bulk-assets/asset-table";
import BulkAssetsCards from "@/components/tracking/bulk-assets/asset-card";
import Pagination from "@/components/pagination/pagination";
import { BulkAsset } from "@/lib/data/bulkAssets";
// Modal imports
import ViewBulkAssetModal from "@/components/modals/tracking/bulk-assets/view-bulk-asset-modal";

import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api/axiosInterceptor";

// Types based on your API response
interface ApiBulkAsset {
  assetId: number;
  name: string;
  isBulk: boolean;
  bulkStatus: string;
  currentStockLevel: number;
  minimumThreshold: number;
  lastRestocked: string;
  modelNumber: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  location: {
    locationId: number;
    regionName: string;
    departmentName: string;
    notes: string;
  } | null;
  keeper: {
    payrollNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
  } | null;
  stockMetrics: {
    isLowStock: boolean;
    stockPercentage: number;
    totalQuantityRestocked: number;
    totalRestockEvents: number;
    averageRestockQuantity: number;
  };
  mostRecentRestock: any | null;
}

interface BulkAssetsResponse {
  success: boolean;
  data: ApiBulkAsset[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary?: {
    totalAssets: number;
    lowStockAssets: number;
    activeAssets: number;
    outOfStockAssets: number;
    discontinuedAssets: number;
  };
}

// Transform API data to match your existing component interface
const transformApiBulkAsset = (apiAsset: ApiBulkAsset): BulkAsset => ({
  id: apiAsset.assetId,
  name: apiAsset.name,
  issuedBy: apiAsset.keeper?.fullName || "N/A",
  department: apiAsset.location ? `${apiAsset.location.regionName} - ${apiAsset.location.departmentName}` : "N/A",
  issuedTo: apiAsset.keeper?.fullName || "N/A",
  signatory: apiAsset.keeper?.fullName || "N/A",
  timestamp: apiAsset.lastRestocked ? new Date(apiAsset.lastRestocked).toLocaleDateString() : "N/A",
  quantity: apiAsset.currentStockLevel,
  notes: apiAsset.notes || "",
  status: apiAsset.bulkStatus === "active" ? "Issued" : "Not Issued" as "Issued" | "Not Issued",
});

const fetchBulkAssets = async (
  page: number, 
  limit: number, 
  search: string = ""
): Promise<BulkAssetsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status: "active"
  });

  // Only add search param if it's not empty
  if (search.trim()) {
    params.append("search", search.trim());
  }

  const response = await api.get(`/bulk-asset-tracking?${params.toString()}`);
  return response.data;
};

// API functions for mutations
const updateBulkAsset = async (assetData: Partial<BulkAsset> & { id: number }) => {
  const response = await api.put(`/bulk-asset-tracking/${assetData.id}`, assetData);
  return response.data;
};

const toggleAssetStatus = async (assetId: number) => {
  const response = await api.patch(`/bulk-asset-tracking/${assetId}/toggle-status`);
  return response.data;
};

const deleteBulkAsset = async (assetId: number) => {
  const response = await api.delete(`/bulk-asset-tracking/${assetId}`);
  return response.data;
};

export default function BulkAssetsTracking() {
  const queryClient = useQueryClient();
  const [selectedAsset, setSelectedAsset] = useState<BulkAsset | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BulkAsset>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Query key for caching - memoized for performance
  const queryKey = useMemo(() => 
    ['bulk-assets', currentPage, limit, debouncedSearchTerm], 
    [currentPage, limit, debouncedSearchTerm]
  );

  // React Query for fetching data with search
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: () => fetchBulkAssets(currentPage, limit, debouncedSearchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Mutation for updating assets
  const updateAssetMutation = useMutation({
    mutationFn: updateBulkAsset,
    onSuccess: () => {
      // Invalidate and refetch the assets query
      queryClient.invalidateQueries({ queryKey: ['bulk-assets'] });
      console.log('Asset updated successfully');
    },
    onError: (error) => {
      console.error('Error updating asset:', error);
    }
  });

  // Mutation for toggling asset status
  const toggleStatusMutation = useMutation({
    mutationFn: toggleAssetStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-assets'] });
      console.log('Asset status toggled successfully');
    },
    onError: (error) => {
      console.error('Error toggling asset status:', error);
    }
  });

  // Mutation for deleting assets
  const deleteAssetMutation = useMutation({
    mutationFn: deleteBulkAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-assets'] });
      setSelectedAsset(null); // Close modal
      console.log('Asset deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting asset:', error);
    }
  });

  // Transform API data to component format - memoized for performance
  const transformedAssets = useMemo(() => 
    response?.data.map(transformApiBulkAsset) || [],
    [response?.data]
  );

  // Handle search functionality - useCallback for performance
  const handleSearch = useCallback((term: string) => {
    setDebouncedSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleUpdateAsset = useCallback((updatedAsset: Partial<BulkAsset> & { id: number }) => {
    updateAssetMutation.mutate(updatedAsset);
  }, [updateAssetMutation]);

  const handleToggleStatus = useCallback((assetId: number) => {
    toggleStatusMutation.mutate(assetId);
  }, [toggleStatusMutation]);

  const handleDeleteAsset = useCallback((assetId: number) => {
    deleteAssetMutation.mutate(assetId);
  }, [deleteAssetMutation]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Clear search functionality - useCallback for performance
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
  }, []);

  // Show loading for any mutation or fetch operation
  const isAnyLoading = isLoading || isFetching || 
    updateAssetMutation.isPending || 
    toggleStatusMutation.isPending || 
    deleteAssetMutation.isPending;

  // Check for any mutation errors
  const hasMutationError = updateAssetMutation.isError || 
    toggleStatusMutation.isError || 
    deleteAssetMutation.isError;

  // Loading state
  if (isLoading && !isFetching) {
    return (
      <div className="p-6">
        <div className="py-3 flex flex-col gap-5 sm:flex-row">
          <h1 className="text-2xl font-bold text-kr-maroon-dark">
            Bulk Asset Tracking
          </h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-kr-maroon" />
          <span className="ml-2 text-lg">Loading assets...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <div className="py-3 flex flex-col gap-5 sm:flex-row">
          <h1 className="text-2xl font-bold text-kr-maroon-dark">
            Bulk Asset Tracking
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">
              Error loading assets: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <button 
              onClick={() => refetch()} 
              className="bg-kr-maroon-dark text-white px-4 py-2 rounded hover:bg-kr-maroon transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-5 py-3 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">
          Bulk Asset Tracking
        </h1>
        <BulkSearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          placeholder="Search by asset name, model number, or keeper..."
        />
      </div>

      {/* Mutation error banner */}
      {hasMutationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">
            {updateAssetMutation.error?.message || 
             toggleStatusMutation.error?.message || 
             deleteAssetMutation.error?.message || 
             'An error occurred while processing your request'}
          </span>
        </div>
      )}

      {/* Show search results info */}
      {response && (
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <p className="text-sm text-gray-600">
              {debouncedSearchTerm ? (
                <>
                  Found <span className="font-semibold">{response.pagination.totalCount}</span> assets matching 
                  <span className="font-semibold text-kr-maroon"> "{debouncedSearchTerm}"</span>
                </>
              ) : (
                <>
                  Showing <span className="font-semibold">{transformedAssets.length}</span> of 
                  <span className="font-semibold"> {response.pagination.totalCount}</span> total assets
                </>
              )}
            </p>
          </div>
          
          {/* Summary stats */}
          {response.summary && (
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="text-green-600">Active: {response.summary.activeAssets}</span>
              <span className="text-orange-600">Low Stock: {response.summary.lowStockAssets}</span>
              <span className="text-red-600">Out of Stock: {response.summary.outOfStockAssets}</span>
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {transformedAssets.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            {debouncedSearchTerm 
              ? `No assets found matching "${debouncedSearchTerm}"` 
              : "No assets found"
            }
          </p>
          {debouncedSearchTerm && (
            <button 
              onClick={handleClearSearch}
              className="text-kr-maroon hover:text-kr-maroon-dark text-sm underline"
            >
              Clear search and show all assets
            </button>
          )}
        </div>
      )}

      {/* Loading overlay for any operations */}
      {isAnyLoading && !isLoading && (
        <div className="mb-4 flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-kr-maroon mr-2" />
          <span className="text-sm text-gray-600">
            {isFetching ? 'Searching...' : 
             updateAssetMutation.isPending ? 'Updating asset...' :
             toggleStatusMutation.isPending ? 'Updating status...' :
             deleteAssetMutation.isPending ? 'Deleting asset...' : 
             'Processing...'}
          </span>
        </div>
      )}

      {/* Desktop Table View */}
      {transformedAssets.length > 0 && (
        <div className="hidden md:block">
          <BulkAssetsTable
            assets={transformedAssets}
            setSelectedAsset={setSelectedAsset}
            setEditFormData={setEditFormData}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      )}

      {/* Mobile Card View */}
      {transformedAssets.length > 0 && (
        <div className="block md:hidden">
          <BulkAssetsCards
            assets={transformedAssets}
            setSelectedAsset={setSelectedAsset}
            setEditFormData={setEditFormData}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      )}

      {/* Pagination */}
      {response && response.pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={response.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modals */}
      <ViewBulkAssetModal selectedAsset={selectedAsset} />
    </div>
  );
}