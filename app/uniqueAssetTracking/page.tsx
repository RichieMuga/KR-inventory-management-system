"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// Component imports
import SearchBar from "@/components/tracking/unique-assets/search-bar";
import AssetsTable from "@/components/tracking/unique-assets/asset-table";
import AssetsCards from "@/components/tracking/unique-assets/asset-cards";
import Pagination from "@/components/pagination/pagination";
import { UniqueAsset } from "@/lib/data/uniqueAssets";
// Modal imports
import ViewAssetModal from "@/components/modals/tracking/view-unique-asset-modal";
import EditAssetModal from "@/components/modals/tracking/edit-unique-asset-modal";
import MoveAssetModal from "@/components/modals/tracking/move-unique-asset-modal";
import AssignAssetModal from "@/components/modals/tracking/assign-unique-asset-modal";
import DeleteAssetModal from "@/components/modals/tracking/delete-unique-asset-modal";

import { Loader2 } from "lucide-react";
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
  };
  keeper: {
    payrollNumber: string;
    firstName: string;
    lastName: string;
  };
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
}

// Transform API data to match your existing component interface
const transformApiAsset = (apiAsset: ApiUniqueAsset): UniqueAsset => ({
  id: apiAsset.assetId.toString(),
  name: apiAsset.name,
  serialNumber: apiAsset.serialNumber,
  defaultLocation: `${apiAsset.location.regionName} - ${apiAsset.location.departmentName}`,
  movedTo: `${apiAsset.location.regionName} - ${apiAsset.location.departmentName}`, // Assuming current location
  issuedTo: apiAsset.currentAssignment 
    ? apiAsset.currentAssignment.assignedToName 
    : "Not Assigned",
  status: apiAsset.individualStatus === "in_use" ? "In Use" : "Not In Use" as "In Use" | "Not In Use",
  keeper: `${apiAsset.keeper.firstName} ${apiAsset.keeper.lastName}`,
});

const fetchUniqueAssets = async (page: number, limit: number): Promise<UniqueAssetsResponse> => {
  const response = await api.get(`/unique-asset-tracking?page=${page}&limit=${limit}`);
  return response.data;
};

export default function UniqueAssetsTracking() {
  const [selectedAsset, setSelectedAsset] = useState<UniqueAsset | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UniqueAsset>>({});
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
    queryKey: ['unique-assets', currentPage, limit],
    queryFn: () => fetchUniqueAssets(currentPage, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Transform API data to component format
  const transformedAssets = response?.data.map(transformApiAsset) || [];
  
  // Filter assets based on search term
  const filteredAssets = transformedAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.keeper.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.issuedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateAsset = (updatedAsset: Partial<UniqueAsset> & { id: string }) => {
    // After updating, refetch the data to ensure consistency
    refetch();
  };

  const handleDeleteAsset = (assetId: string) => {
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
      <div className="py-3 flex flex-col gap-5 sm:flex-row">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">
          Unique Asset Tracking
        </h1>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* Show total count */}
      {response && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredAssets.length} of {response.pagination.total} assets
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
        <AssetsTable
          assets={filteredAssets}
          setSelectedAsset={setSelectedAsset}
          setEditFormData={setEditFormData}
        />
      )}

      {/* Mobile Card View */}
      {filteredAssets.length > 0 && (
        <AssetsCards
          assets={filteredAssets}
          setSelectedAsset={setSelectedAsset}
          setEditFormData={setEditFormData}
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
      <ViewAssetModal selectedAsset={selectedAsset} />
      <EditAssetModal
        selectedAsset={selectedAsset}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={handleUpdateAsset}
      />
      <MoveAssetModal
        selectedAsset={selectedAsset}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={handleUpdateAsset}
      />
      <AssignAssetModal
        selectedAsset={selectedAsset}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={handleUpdateAsset}
      />
      <DeleteAssetModal
        selectedAsset={selectedAsset}
        onDelete={handleDeleteAsset}
      />
    </div>
  );
}