"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LocationCard } from "@/components/location-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Loader2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleLocationModal } from "@/lib/features/modals/location-modal";
import { RootState } from "@/lib/store";
import CreateLocationModal from "@/components/modals/create-location-modal";
import Pagination from "@/components/pagination/pagination";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api/axiosInterceptor";
import { usePagination } from "@/lib/hooks/usePagination";

interface Location {
  locationId: number;
  regionName: string;
  departmentName: string;
  notes?: string;
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
  search?: string; // Add search field to response type
}

// Optimized fetch function with better error handling
const fetchLocations = async (
  queryParams: Record<string, any>,
): Promise<LocationsResponse> => {
  try {
    // Filter out undefined, null, and empty string values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    console.log("Fetching locations with params:", cleanParams); // Debug log

    const response = await api.get("/locations", {
      params: cleanParams,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching locations:", error); // Debug log
    if (error instanceof Error) {
      throw new Error(`Failed to fetch locations: ${error.message}`);
    }
    throw new Error("An unexpected error occurred");
  }
};

export default function LocationsPage() {
  const dispatch = useDispatch();

  // Use the custom pagination hook
  const {
    queryParams,
    searchInput,
    setSearchInput,
    searchQuery,
    setPage,
    search,
    clearSearch,
    handleSearchKeyPress,
    paginationState,
  } = usePagination("locations");

  // Get modal state
  const { isLocationModalOpen } = useSelector(
    (state: RootState) => state.locationModal,
  );

  // React Query for fetching locations with optimized configuration
  const {
    data: locationsResponse,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["locations", queryParams], // This will trigger refetch when queryParams change
    queryFn: () => fetchLocations(queryParams),
    placeholderData: keepPreviousData, // Keep previous data while loading new data
    staleTime: 5 * 60 * 1000, // 5 minutes - adjust based on how often your data changes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  function handleLocationModalToggle() {
    dispatch(toggleLocationModal());
  }

  // Handle search with Redux dispatch
  const handleSearchClick = () => {
    search(); // This will dispatch to Redux and update queryParams
  };

  const locations = locationsResponse?.data || [];
  const pagination = locationsResponse?.pagination;
  const activeSearch = locationsResponse?.search || searchQuery;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 pt-4">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">Locations</h1>

        {/* Search Section */}
        <div className="relative flex w-full max-w-sm md:max-w-xs">
          <Input
            type="search"
            placeholder="Search locations..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="flex-1 pr-20"
            disabled={isLoading} // Disable during loading
          />

          {/* Clear Search Button */}
          {(searchInput || activeSearch) && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-10 top-0 h-full px-2"
              onClick={clearSearch}
              aria-label="Clear search"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Search Button */}
          <Button
            type="button"
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
            onClick={handleSearchClick}
            aria-label="Search"
            disabled={isLoading || !searchInput.trim()}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Button
          onClick={handleLocationModalToggle}
          className="bg-kr-maroon hover:bg-kr-maroon-dark"
          disabled={isLoading}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Active Search Display */}
      {activeSearch && (
        <div className="px-6 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Searching for:</span>
            <span className="px-2 py-1 bg-muted rounded-md font-medium">
              "{activeSearch}"
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 px-2"
              disabled={isLoading}
            >
              <X className="h-3 w-3" />
            </Button>
            {isFetching && (
              <Loader2 className="h-3 w-3 animate-spin text-kr-orange ml-2" />
            )}
          </div>
        </div>
      )}

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        {/* Loading State - Only show on initial load, not on search */}
        {isLoading && !isFetching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-kr-maroon" />
            <span className="ml-2 text-lg">Loading locations...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-red-500 text-lg mb-4">
              Error loading locations:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {/* Results Summary */}
            {pagination && (
              <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
                <span>
                  {activeSearch ? (
                    <>
                      Found {pagination.totalItems} location
                      {pagination.totalItems !== 1 ? "s" : ""} matching "
                      {activeSearch}"
                    </>
                  ) : (
                    <>
                      Showing {pagination.totalItems} location
                      {pagination.totalItems !== 1 ? "s" : ""}
                    </>
                  )}
                </span>
                {isFetching && (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                )}
              </div>
            )}

            {/* Mobile View: Cards */}
            <div className="grid gap-4 md:hidden">
              {locations.length > 0 ? (
                locations.map((location: Location) => (
                  <LocationCard
                    key={location.locationId}
                    location={{
                      id: location.locationId.toString(),
                      regionName: location.regionName,
                      departmentName: location.departmentName,
                      notes: location.notes,
                    }}
                  />
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {activeSearch ? (
                    <div className="space-y-4">
                      <div className="text-lg">🔍</div>
                      <div>
                        <p className="text-base mb-2">
                          No locations found matching "{activeSearch}"
                        </p>
                        <p className="text-sm">
                          Try adjusting your search terms
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={clearSearch}
                        className="mt-2"
                      >
                        Clear search to see all locations
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-lg">📍</div>
                      <p>No locations available.</p>
                      <Button
                        onClick={handleLocationModalToggle}
                        className="bg-kr-maroon hover:bg-kr-maroon-dark"
                      >
                        Add Your First Location
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-kr-maroon text-white hover:bg-kr-maroon">
                    <TableHead className="text-white">Location ID</TableHead>
                    <TableHead className="text-white">Region</TableHead>
                    <TableHead className="text-white">
                      Department Name
                    </TableHead>
                    <TableHead className="text-white">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.length > 0 ? (
                    locations.map((location: Location) => (
                      <TableRow
                        key={location.locationId}
                        className={isFetching ? "opacity-60" : ""}
                      >
                        <TableCell className="font-medium">
                          {location.locationId}
                        </TableCell>
                        <TableCell>{location.regionName}</TableCell>
                        <TableCell>{location.departmentName}</TableCell>
                        <TableCell>{location.notes || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        {activeSearch ? (
                          <div className="space-y-4">
                            <div className="text-2xl">🔍</div>
                            <div>
                              <p className="text-base mb-2">
                                No locations found matching "{activeSearch}"
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Try adjusting your search terms
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={clearSearch}
                              className="mt-2"
                            >
                              Clear search to see all locations
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-2xl">📍</div>
                            <div>
                              <p className="text-base mb-2">
                                No locations available.
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Get started by adding your first location
                              </p>
                            </div>
                            <Button
                              onClick={handleLocationModalToggle}
                              className="bg-kr-maroon hover:bg-kr-maroon-dark"
                            >
                              Add Your First Location
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </main>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 pb-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />

          {/* Pagination Info */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
            to{" "}
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems,
            )}{" "}
            of {pagination.totalItems} locations
            {activeSearch && (
              <span className="ml-2">(filtered by "{activeSearch}")</span>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {isLocationModalOpen && (
        <CreateLocationModal
          onSubmit={handleLocationModalToggle}
          onClose={handleLocationModalToggle}
          isOpen={isLocationModalOpen}
        />
      )}
    </div>
  );
}
