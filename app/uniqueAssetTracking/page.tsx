"use client";
import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Component imports
import SearchBar from "@/components/tracking/unique-assets/search-bar";
import AssetsTable from "@/components/tracking/unique-assets/asset-table";
import AssetsCards from "@/components/tracking/unique-assets/asset-cards";
import Pagination from "@/components/pagination/pagination";
import { UniqueAsset } from "@/lib/data/uniqueAssets";
// Modal imports
import ViewAssetModal from "@/components/modals/tracking/view-unique-asset-modal";
import MoveAssetModal from "@/components/modals/tracking/move-unique-asset-modal";
import AssignAssetModal from "@/components/modals/tracking/assign-unique-asset-modal";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api/axiosInterceptor";

// Types based on your API response
interface ApiUniqueAsset {
  assetId: number;
  name: string;
  serialNumber: string;
  modelNumber: string;
  individualStatus: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  location: {
    locationId: number;
    regionName: string;
    departmentName: string;
  } | null;
  keeper: {
    payrollNumber: string;
    firstName: string;
    lastName: string;
  } | null;
  currentAssignment: {
    assignmentId: number;
    assignedTo: string;
    assignedToName: string;
    dateIssued: string;
    conditionIssued: string;
    quantity: number;
  } | null;
}

interface UniqueAssetsResponse {
  success: boolean;
  data: ApiUniqueAsset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalAssets: number;
    inUseAssets: number;
    availableAssets: number;
    assignedAssets: number;
  };
}

interface Location {
  locationId: number;
  regionName: string;
  departmentName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface LocationsResponse {
  success: boolean;
  data: Location[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
  };
}

interface MoveAssetRequest {
  toLocationId: number;
  notes?: string;
}

interface MoveAssetResponse {
  success: boolean;
  message: string;
  data: {
    movementId: number;
    updatedAsset: {
      assetId: number;
      name: string;
      serialNumber: string;
      newLocation: {
        locationId: number;
        regionName: string;
        departmentName: string;
      };
      currentAssignment: {
        assignedTo: string;
        assignedToName: string;
        dateIssued: string;
      } | null;
    };
  };
}

// Transform API data to match your existing component interface
const transformApiAsset = (apiAsset: ApiUniqueAsset): UniqueAsset => ({
  id: apiAsset.assetId.toString(),
  name: apiAsset.name,
  serialNumber: apiAsset.serialNumber,
  defaultLocation: apiAsset.location ? `${apiAsset.location.regionName} - ${apiAsset.location.departmentName}` : "N/A",
  movedTo: apiAsset.location ? `${apiAsset.location.regionName} - ${apiAsset.location.departmentName}` : "N/A",
  issuedTo: apiAsset.currentAssignment
    ? apiAsset.currentAssignment.assignedToName
    : "Not Assigned",
  status: apiAsset.individualStatus === "in_use" ? "In Use" : "Not In Use" as "In Use" | "Not In Use",
  keeper: "ICT Manager",
});

const fetchUniqueAssets = async (
  page: number,
  limit: number,
  search: string = ""
): Promise<UniqueAssetsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  // Only add search param if it's not empty
  if (search.trim()) {
    params.append("search", search.trim());
  }

  const response = await api.get(`/unique-asset-tracking?${params.toString()}`);
  return response.data;
};

// API function to fetch all locations
const fetchLocations = async (): Promise<LocationsResponse> => {
  const response = await api.get('/locations');
  return response.data;
};

// API function for moving assets
const moveAsset = async (assignmentId: string, moveData: MoveAssetRequest): Promise<MoveAssetResponse> => {
  const response = await api.patch(`/assignments/${assignmentId}/move`, moveData);
  return response.data;
};

export default function UniqueAssetsTracking() {
  const queryClient = useQueryClient();
  const [selectedAsset, setSelectedAsset] = useState<UniqueAsset | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UniqueAsset>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Query key for caching
  const queryKey = ['unique-assets', currentPage, limit, debouncedSearchTerm];

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
    queryFn: () => fetchUniqueAssets(currentPage, limit, debouncedSearchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry failed requests twice
  });

  // React Query for fetching locations
  const {
    data: locationsResponse,
    isLoading: locationsLoading
  } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 10 * 60 * 1000, // 10 minutes - locations don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Mutation for moving assets
  const moveAssetMutation = useMutation({
    mutationFn: ({ assignmentId, moveData }: { assignmentId: string; moveData: MoveAssetRequest }) =>
      moveAsset(assignmentId, moveData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unique-assets'] });
      setSelectedAsset(null); // Close modal
      console.log('Asset moved successfully:', data.message);
    },
    onError: (error) => {
      console.error('Error moving asset:', error);
    }
  });

  // Transform API data to component format
  const transformedAssets = response?.data.map(transformApiAsset) || [];
  const locations = locationsResponse?.data || [];

  // Handle search functionality
  const handleSearch = useCallback((term: string) => {
    setDebouncedSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleMoveAsset = (assignmentId: string, moveData: MoveAssetRequest) => {
    moveAssetMutation.mutate({ assignmentId, moveData });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Clear search functionality
  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
  };

  // Show loading for any mutation or fetch operation
  const isAnyLoading = isLoading || isFetching || moveAssetMutation.isPending;

  // Check for any mutation errors
  const hasMutationError = moveAssetMutation.isError;

  // Loading state
  if (isLoading && !isFetching) {
    return (
      <div className="p-6">
        <div className="py-3 flex flex-col gap-5 sm:flex-row">
          <h1 className="text-2xl font-bold text-kr-maroon-dark">
            Unique Asset Tracking
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
            Unique Asset Tracking
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
          Unique Asset Tracking
        </h1>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          placeholder="Search by name, serial number, or keeper..."
          isLoading={isFetching}
        />
      </div>

      {/* Mutation error banner */}
      {hasMutationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">
            {moveAssetMutation.error?.message || 'An error occurred while processing your request'}
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
                  Found <span className="font-semibold">{response.pagination.total}</span> assets matching
                  <span className="font-semibold text-kr-maroon"> "{debouncedSearchTerm}"</span>
                </>
              ) : (
                <>
                  Showing <span className="font-semibold">{transformedAssets.length}</span> of
                  <span className="font-semibold"> {response.pagination.total}</span> total assets
                </>
              )}
            </p>
          </div>
         
          {/* Summary stats */}
          {response.summary && (
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="text-green-600">Available: {response.summary.availableAssets}</span>
              <span className="text-blue-600">In Use: {response.summary.inUseAssets}</span>
              <span className="text-purple-600">Assigned: {response.summary.assignedAssets}</span>
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
             moveAssetMutation.isPending ? 'Moving asset...' :
             'Processing...'}
          </span>
        </div>
      )}

      {/* Desktop Table View */}
      {transformedAssets.length > 0 && (
        <div className="hidden md:block">
          <AssetsTable
            assets={transformedAssets}
            setSelectedAsset={setSelectedAsset}
            setEditFormData={setEditFormData}
          />
        </div>
      )}

      {/* Mobile Card View */}
      {transformedAssets.length > 0 && (
        <div className="block md:hidden">
          <AssetsCards
            assets={transformedAssets}
            setSelectedAsset={setSelectedAsset}
            setEditFormData={setEditFormData}
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
      <ViewAssetModal selectedAsset={selectedAsset} />
      <MoveAssetModal
        selectedAsset={selectedAsset}
        locations={locations}
        locationsLoading={locationsLoading}
        onMove={handleMoveAsset}
        isLoading={moveAssetMutation.isPending}
      />
      <AssignAssetModal
        selectedAsset={selectedAsset}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={() => {}}
      />
    </div>
  );
}