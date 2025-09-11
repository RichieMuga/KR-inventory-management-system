"use client";

import type React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AssetCard } from "./asset-bulk-card";
import { AssetTable } from "./asset-bulk-table";
import { Search, PlusCircle, Loader2 } from "lucide-react";
import { RootState } from "@/lib/store";
import BulkAssetModal from "@/components/modals/create-bulk-asset-modal";
import Pagination from "@/components/pagination/pagination";
import { toggleBulkModal } from "@/lib/features/modals/asset-modal-buttons";
import { api } from "@/lib/api/axiosInterceptor";

// Location data interface
interface LocationData {
  locationId: number;
  regionName: string;
  departmentName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface LocationResponse {
  success: boolean;
  data: LocationData;
}

// API response interface
interface ApiAsset {
  assetId: number;
  name: string;
  keeperPayrollNumber: string;
  locationId: number;
  serialNumber: string | null;
  isBulk: boolean;
  individualStatus: string | null;
  bulkStatus: string;
  currentStockLevel: number;
  minimumThreshold: number;
  lastRestocked: string;
  modelNumber: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Enhanced legacy interface with location details
interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  region: string;
  availability: "Available" | "Assigned" | "In Repair" | "Disposed";
  location: string;
  keeper: string;
  isBulk: boolean;
  quantity?: number;
  locationId?: number;
}

interface ApiResponse {
  page: number;
  limit: number;
  total: string;
  totalPages: number;
  data: ApiAsset[];
}

// Function to fetch location details
const fetchLocationDetails = async (
  locationId: number,
): Promise<LocationData> => {
  const response = await api.get(`/locations/${locationId}`);
  return response.data.data;
};

// Function to fetch assets
const fetchAssets = async (
  page: number = 1,
  limit: number = 10,
): Promise<ApiResponse> => {
  const response = await api.get(`/?page=${page}&limit=${limit}`);
  return response.data;
};

export function AssetListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchTerm, setDisplaySearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can make this configurable if needed
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

  const { isBulkAssetModalOpen } = useSelector(
    (state: RootState) => state.assetModal,
  );

  // React Query to fetch assets with pagination
  const {
    data: assetsResponse,
    isLoading: isLoadingAssets,
    error: assetsError,
    refetch: refetchAssets,
  } = useQuery({
    queryKey: ["assets", currentPage, itemsPerPage],
    queryFn: () => fetchAssets(currentPage, itemsPerPage),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Get unique location IDs from assets
  const locationIds = useMemo(() => {
    if (!assetsResponse?.data) return [];
    const ids = [
      ...new Set(assetsResponse.data.map((asset) => asset.locationId)),
    ];
    return ids;
  }, [assetsResponse]);

  // Use useQueries to fetch all location details in parallel
  const locationQueries = useQueries({
    queries: locationIds.map((locationId) => ({
      queryKey: ["location", locationId],
      queryFn: () => fetchLocationDetails(locationId),
      staleTime: 10 * 60 * 1000, // 10 minutes - locations change less frequently
      retry: 2,
    })),
  });

  // Check if all location queries are loaded
  const isLoadingLocations = locationQueries.some((query) => query.isLoading);
  const locationErrors = locationQueries.filter((query) => query.error);

  // Create a map of locationId to location data for quick lookup
  const locationMap = useMemo(() => {
    const map = new Map<number, LocationData>();
    locationQueries.forEach((query, index) => {
      if (query.data) {
        map.set(locationIds[index], query.data);
      }
    });
    return map;
  }, [locationQueries, locationIds]);

  // Transform assets with location data
  const transformedAssets = useMemo(() => {
    if (!assetsResponse?.data || isLoadingLocations) return [];

    const mapBulkStatusToAvailability = (
      bulkStatus: string,
    ): "Available" | "Assigned" | "In Repair" | "Disposed" => {
      switch (bulkStatus.toLowerCase()) {
        case "active":
          return "Available";
        case "assigned":
          return "Assigned";
        case "repair":
        case "in_repair":
          return "In Repair";
        case "disposed":
          return "Disposed";
        default:
          return "Available";
      }
    };

    return assetsResponse.data.map((apiAsset): Asset => {
      const locationData = locationMap.get(apiAsset.locationId);

      return {
        id: apiAsset.assetId.toString(),
        name: apiAsset.name,
        serialNumber: apiAsset.serialNumber || apiAsset.modelNumber,
        region: locationData?.regionName || `Location ${apiAsset.locationId}`,
        availability: mapBulkStatusToAvailability(apiAsset.bulkStatus),
        location:
          locationData?.departmentName || `Location ${apiAsset.locationId}`,
        keeper: apiAsset.keeperPayrollNumber,
        isBulk: apiAsset.isBulk,
        quantity: apiAsset.currentStockLevel,
        locationId: apiAsset.locationId,
      };
    });
  }, [assetsResponse, locationMap, isLoadingLocations]);

  const suggestions = useMemo(() => {
    if (!displaySearchTerm) return [];
    const lowerCaseSearchTerm = displaySearchTerm.toLowerCase();
    return transformedAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.serialNumber.toLowerCase().includes(lowerCaseSearchTerm),
    );
  }, [displaySearchTerm, transformedAssets]);

  const filteredAssets = useMemo(() => {
    if (!searchTerm) {
      return transformedAssets;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return transformedAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.serialNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.location.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.region.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.keeper.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.availability.toLowerCase().includes(lowerCaseSearchTerm),
    );
  }, [searchTerm, transformedAssets]);

  const handleSearch = () => {
    setSearchTerm(displaySearchTerm);
    setShowSuggestions(false);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const handleSuggestionClick = (suggestion: Asset) => {
    setDisplaySearchTerm(suggestion.name);
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplaySearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    if (displaySearchTerm) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };

  const handleToggleBulkAssetModal = () => {
    dispatch(toggleBulkModal());
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading state
  if (isLoadingAssets || isLoadingLocations) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-kr-maroon-dark">
            Bulk Asset Inventory
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-kr-maroon" />
            <span className="text-muted-foreground">
              {isLoadingAssets
                ? "Loading assets..."
                : "Loading location details..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (assetsError || locationErrors.length > 0) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-kr-maroon-dark">
            Bulk Asset Inventory
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              {assetsError
                ? `Error loading assets: ${assetsError instanceof Error ? assetsError.message : "Unknown error"}`
                : `Error loading location details: ${locationErrors.length} location(s) failed to load`}
            </p>
            <Button
              onClick={() => {
                refetchAssets();
                locationQueries.forEach((query) => query.refetch());
              }}
              variant="outline"
              className="border-kr-maroon text-kr-maroon hover:bg-kr-maroon hover:text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">
          Bulk Asset Inventory
        </h1>
        <div className="relative flex w-full max-w-sm md:max-w-xs">
          <Input
            type="search"
            placeholder="Search assets by name or serial..."
            className="flex-1 pr-10"
            value={displaySearchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            ref={searchInputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
            onClick={handleSearch}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
              {suggestions.map((asset) => (
                <div
                  key={asset.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onMouseDown={() => handleSuggestionClick(asset)}
                >
                  <span className="font-medium">{asset.name}</span>
                  <span className="text-muted-foreground ml-2">
                    ({asset.serialNumber})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button
          onClick={handleToggleBulkAssetModal}
          className="bg-kr-maroon hover:bg-kr-maroon-dark"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Bulk Asset
        </Button>
      </div>

      {/* Display pagination info and total assets count */}
      {assetsResponse && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-muted-foreground">
          <div>Total Assets: {assetsResponse.total}</div>
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(
              currentPage * itemsPerPage,
              parseInt(assetsResponse.total),
            )}{" "}
            of {assetsResponse.total} assets
          </div>
        </div>
      )}

      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No assets found matching your search.
          </p>
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block">
        {filteredAssets.length > 0 ? (
          <AssetTable assets={filteredAssets} />
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No assets found matching your search.
          </p>
        )}
      </div>

      {/* Pagination - only show if there are multiple pages and no search is active */}
      {assetsResponse && assetsResponse.totalPages > 1 && !searchTerm && (
        <Pagination
          currentPage={currentPage}
          totalPages={assetsResponse.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {isBulkAssetModalOpen && <BulkAssetModal />}
    </div>
  );
}
