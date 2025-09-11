"use client";

import type React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";

import { useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AssetCard } from "./asset-unique-card";
import { AssetTable } from "./asset-unique-table";
import { Search, PlusCircle, Loader2 } from "lucide-react";
import { toggleUniqueModal } from "@/lib/features/modals/asset-modal-buttons";
import { RootState } from "@/lib/store";
import UniqueAssetModal from "@/components/modals/unique-asset-modal";
import Pagination from "@/components/pagination/pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { api } from "@/lib/api/axiosInterceptor";

// Updated interface to match API response with your location schema
interface Asset {
  assetId: number;
  name: string;
  serialNumber: string;
  keeperPayrollNumber: string;
  keeperName: string;
  locationId: number;
  isBulk: boolean;
  individualStatus: "in_use" | "not_in_use" | "under_maintenance" | "disposed";
  bulkStatus: string | null;
  currentStockLevel: number | null;
  minimumThreshold: number;
  lastRestocked: string | null;
  modelNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  location?: {
    locationId: number;
    regionName: string;
    departmentName: string;
    notes?: string;
  };
}

// Interface for transformed assets used by components
interface TransformedAsset {
  id: string;
  name: string;
  serialNumber: string;
  region: string;
  availability: "Available" | "Assigned" | "In Repair" | "Disposed";
  location: string;
  keeper: string;
  keeperName: string | null;
  isBulk: boolean;
  quantity?: number;
  modelNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  locationNotes?: string;
  fullLocationInfo?: {
    locationId: number;
    regionName: string;
    departmentName: string;
    notes?: string;
  };
}

interface ApiResponse {
  page: number;
  limit: number;
  total: string;
  totalPages: number;
  data: Asset[];
}

// Fetch function for assets
const fetchAssets = async (
  page: number,
  limit: number,
  searchQuery?: string,
): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (searchQuery && searchQuery.trim()) {
    params.append("search", searchQuery.trim());
  }

  const response = await api.get(`/uniqueAssets?${params.toString()}`);
  return response.data;
};

export function AssetListView() {
  const [displaySearchTerm, setDisplaySearchTerm] = useState(""); // For input field
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

  const { isUniqueAssetModalOpen } = useSelector(
    (state: RootState) => state.assetModal,
  );

  // Use pagination hook
  const {
    currentPage,
    searchQuery,
    itemsPerPage,
    setPage,
    search,
    clearSearch,
  } = usePagination("assets");

  // Fetch assets with useQuery
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery<ApiResponse, Error>({
    queryKey: ["assets", currentPage, itemsPerPage, searchQuery],
    queryFn: () => fetchAssets(currentPage, itemsPerPage, searchQuery),
    placeholderData: (previousData) => previousData, // Updated from keepPreviousData
  });

  const assets = apiResponse?.data || [];
  const totalPages = apiResponse?.totalPages || 1;
  const total = parseInt(apiResponse?.total || "0");

  // Suggestions based on current assets (for autocomplete)
  const suggestions = useMemo(() => {
    if (!displaySearchTerm || !assets.length) return [];
    const lowerCaseSearchTerm = displaySearchTerm.toLowerCase();
    return assets
      .filter(
        (asset: Asset) =>
          asset.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          asset.serialNumber.toLowerCase().includes(lowerCaseSearchTerm),
      )
      .slice(0, 5); // Limit to 5 suggestions
  }, [displaySearchTerm, assets]);

  const handleSearch = () => {
    search(displaySearchTerm);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: Asset) => {
    const searchTerm = suggestion.name;
    setDisplaySearchTerm(searchTerm);
    search(searchTerm);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplaySearchTerm(value);
    setShowSuggestions(value.length > 0);
  };

  const handleInputFocus = () => {
    if (displaySearchTerm) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click on suggestion item
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };

  const handleToggleUniqueAssetModal = () => {
    dispatch(toggleUniqueModal());
  };

  const handleClearSearch = () => {
    setDisplaySearchTerm("");
    clearSearch();
    setShowSuggestions(false);
  };

  // Transform assets to match the expected format for existing components
  const transformedAssets: TransformedAsset[] = assets.map((asset: Asset) => ({
    id: asset.assetId.toString(),
    name: asset.name,
    serialNumber: asset.serialNumber,
    region: asset.location?.regionName || "Unknown Region",
    availability:
      asset.individualStatus === "in_use"
        ? ("Assigned" as const)
        : asset.individualStatus === "not_in_use"
          ? ("Available" as const)
          : asset.individualStatus === "under_maintenance"
            ? ("In Repair" as const)
            : ("Disposed" as const),
    location:
      asset.location?.departmentName || `Location ID: ${asset.locationId}`,
    keeper: asset.keeperPayrollNumber,
    keeperName: asset.keeperName, // Convert undefined to null
    isBulk: asset.isBulk,
    quantity: asset.currentStockLevel ?? undefined,
    modelNumber: asset.modelNumber,
    notes: asset.notes,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    // Additional fields for enhanced display
    locationNotes: asset.location?.notes,
    fullLocationInfo: asset.location,
  }));

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">
          Unique Asset Inventory
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
                e.preventDefault();
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
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
              {suggestions.map((asset) => (
                <div
                  key={asset.assetId}
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
          onClick={handleToggleUniqueAssetModal}
          className="bg-kr-maroon hover:bg-kr-maroon-dark"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Unique Asset
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-kr-maroon" />
          <span className="ml-2 text-muted-foreground">Loading assets...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 font-medium">Failed to load assets</p>
            <p className="text-muted-foreground text-sm mt-1">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {/* Search Results Info */}
          {searchQuery && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-kr-maroon/5 to-kr-orange/5 p-4 rounded-lg border border-kr-maroon/10">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-kr-maroon" />
                <span className="text-sm font-medium text-kr-maroon-dark">
                  Found {total} result{total !== 1 ? "s" : ""} for "
                  {searchQuery}"
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="text-kr-maroon hover:text-kr-maroon-dark hover:bg-kr-maroon/10 mt-2 sm:mt-0"
              >
                Clear search
              </Button>
            </div>
          )}


          {/* Mobile View: Cards */}
          <div className="grid gap-4 md:hidden">
            {transformedAssets.length > 0 ? (
              transformedAssets.map((asset: TransformedAsset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery
                  ? "No assets found matching your search."
                  : "No assets available."}
              </p>
            )}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block">
            {transformedAssets.length > 0 ? (
              <AssetTable assets={transformedAssets} />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery
                  ? "No assets found matching your search."
                  : "No assets available."}
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {isUniqueAssetModalOpen && <UniqueAssetModal />}
    </div>
  );
}
