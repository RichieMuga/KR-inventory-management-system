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
}

// Updated fetch function to handle query params
const fetchLocations = async (
  queryParams: Record<string, any>,
): Promise<LocationsResponse> => {
  try {
    // Filter out undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== undefined),
    );

    const response = await api.get("/locations", {
      params: cleanParams,
    });

    return response.data;
  } catch (error) {
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
  } = usePagination("locations");

  // Get modal state
  const { isLocationModalOpen } = useSelector(
    (state: RootState) => state.locationModal,
  );

  // React Query for fetching locations
  const {
    data: locationsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["locations", queryParams],
    queryFn: () => fetchLocations(queryParams),
    placeholderData: keepPreviousData,
  });

  function handleLocationModalToggle() {
    dispatch(toggleLocationModal());
  }

  const locations = locationsResponse?.data || [];
  const pagination = locationsResponse?.pagination;

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
          />

          {/* Clear Search Button */}
          {(searchInput || searchQuery) && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-10 top-0 h-full px-2"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Search Button */}
          <Button
            type="button"
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
            onClick={() => search()}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleLocationModalToggle}
          className="bg-kr-maroon hover:bg-kr-maroon-dark"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Active Search Display */}
      {searchQuery && (
        <div className="px-6 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Searching for:</span>
            <span className="px-2 py-1 bg-muted rounded-md font-medium">
              "{searchQuery}"
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-kr-maroon" />
            <span className="ml-2 text-lg">Loading locations...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex items-center justify-center py-8">
            <p className="text-red-500 text-lg">
              Error loading locations:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && (
          <>
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
                  {searchQuery ? (
                    <div>
                      <p>No locations found matching "{searchQuery}"</p>
                      <Button
                        variant="link"
                        onClick={clearSearch}
                        className="mt-2"
                      >
                        Clear search to see all locations
                      </Button>
                    </div>
                  ) : (
                    <p>No locations found.</p>
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
                      <TableRow key={location.locationId}>
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
                      <TableCell colSpan={4} className="text-center py-8">
                        {searchQuery ? (
                          <div>
                            <p>No locations found matching "{searchQuery}"</p>
                            <Button
                              variant="link"
                              onClick={clearSearch}
                              className="mt-2"
                            >
                              Clear search to see all locations
                            </Button>
                          </div>
                        ) : (
                          <p>No locations found.</p>
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
