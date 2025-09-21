"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// Component imports
import BulkSearchBar from "@/components/tracking/bulk-assets/search-bar"
import BulkAssetsTable from "@/components/tracking/bulk-assets/asset-table";
import BulkAssetsCards from "@/components/tracking/bulk-assets/asset-card";
import Pagination from "@/components/pagination/pagination";
import { BulkAsset } from "@/lib/data/bulkAssets";
// Modal imports
import ViewBulkAssetModal from "@/components/modals/tracking/bulk-assets/view-bulk-asset-modal";
import EditBulkAssetModal from "@/components/modals/tracking/bulk-assets/edit-bulk-asset-modal";
import DeleteBulkAssetModal from "@/components/modals/tracking/bulk-assets/delete-bulk-asset-modal";

import { Loader2 } from "lucide-react";
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
  };
  keeper: {
    payrollNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
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
}

// Transform API data to match your existing component interface
const transformApiBulkAsset = (apiAsset: ApiBulkAsset): BulkAsset => ({
  id: apiAsset.assetId,
  name: apiAsset.name,
  issuedBy: apiAsset.keeper.fullName,
  department: `${apiAsset.location.regionName} - ${apiAsset.location.departmentName}`,
  issuedTo: apiAsset.keeper.fullName, // Assuming keeper is the person issued to
  signatory: apiAsset.keeper.fullName, // Assuming keeper is also signatory
  timestamp: new Date(apiAsset.lastRestocked).toLocaleDateString(),
  quantity: apiAsset.currentStockLevel,
  notes: apiAsset.notes || "",
  status: apiAsset.bulkStatus === "active" ? "Issued" : "Not Issued" as "Issued" | "Not Issued",
});

const fetchBulkAssets = async (page: number, limit: number): Promise<BulkAssetsResponse> => {
  const response = await api.get(`/bulk-asset-tracking?page=${page}&limit=${limit}`);
  return response.data;
};

export default function BulkAssetsTracking() {
  const [selectedAsset, setSelectedAsset] = useState<BulkAsset | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BulkAsset>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // React Query for fetching data
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['bulk-assets', currentPage, limit],
    queryFn: () => fetchBulkAssets(currentPage, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Transform API data to component format
  const transformedAssets = response?.data.map(transformApiBulkAsset) || [];
  
  // Filter assets based on search term
  const filteredAssets = transformedAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.issuedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.issuedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.signatory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateAsset = (updatedAsset: Partial<BulkAsset> & { id: number }) => {
    // After updating, refetch the data to ensure consistency
    refetch();
  };

  const handleToggleStatus = (assetId: number) => {
    // After toggling status, refetch the data
    refetch();
  };

  const handleDeleteAsset = (assetId: number) => {
    // After deleting, refetch the data
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
            <p className="text-red-600 mb-4">
              Error loading assets: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <button 
              onClick={() => refetch()} 
              className="bg-kr-maroon-dark text-white px-4 py-2 rounded hover:bg-kr-maroon transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-5 py-3 sm:flex-row">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">
          Bulk Asset Tracking
        </h1>
        <BulkSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* Show total count */}
      {response && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredAssets.length} of {response.pagination.totalCount} assets
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </p>
        </div>
      )}

      {/* No results message */}
      {filteredAssets.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? `No assets found matching "${searchTerm}"` : "No assets found"}
          </p>
        </div>
      )}

      {/* Desktop Table View */}
      {filteredAssets.length > 0 && (
        <BulkAssetsTable
          assets={filteredAssets}
          setSelectedAsset={setSelectedAsset}
          setEditFormData={setEditFormData}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Mobile Card View */}
      {filteredAssets.length > 0 && (
        <BulkAssetsCards
          assets={filteredAssets}
          setSelectedAsset={setSelectedAsset}
          setEditFormData={setEditFormData}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Pagination */}
      {response && response.pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={response.pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modals */}
      <ViewBulkAssetModal selectedAsset={selectedAsset} />
      <EditBulkAssetModal
        selectedAsset={selectedAsset}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={handleUpdateAsset}
      />
      <DeleteBulkAssetModal
        selectedAsset={selectedAsset}
        onDelete={handleDeleteAsset}
      />
    </div>
  );
}