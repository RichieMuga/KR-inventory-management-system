"use client";

import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axiosInterceptor";
import { usePagination } from "@/lib/hooks/usePagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCard } from "@/components/user-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Loader2, X } from "lucide-react";
import { toggleUserModal } from "@/lib/features/modals/user-creation-modal";
import { RootState } from "@/lib/store";
import CreateUserModal from "@/components/modals/user-creation-modal";
import Pagination from "@/components/pagination/pagination";

interface User {
  payrollNumber: string;
  firstName: string;
  lastName: string;
  role: "admin" | "keeper" | "viewer";
  mustChangePassword: boolean;
  defaultLocationId: number | null;
  createdAt: string;
  updatedAt: string;
  defaultLocation: {
    locationId: number;
    departmentName: string;
    regionName: string;
    notes: string;
  } | null;
}

interface UsersResponse {
  page: number;
  limit: number;
  total: string;
  totalPages: number;
  data: User[];
}

// Function to fetch users from API with query parameters
const fetchUsers = async (
  queryParams: Record<string, any>,
): Promise<UsersResponse> => {
  const searchParams = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const response = await api.get(`/users?${searchParams.toString()}`);
  return response.data;
};

export default function UsersPage() {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-kr-maroon-dark text-white";
      case "keeper":
        return "bg-kr-orange-dark text-white";
      case "viewer":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const dispatch = useDispatch();

  // Use the pagination hook
  const {
    queryParams,
    searchInput,
    setSearchInput,
    hasActiveSearch,
    setPage,
    search,
    clearSearch,
    currentPage,
    searchQuery,
  } = usePagination("users");

  const { isUserModalOpen } = useSelector(
    (state: RootState) => state.userModal,
  );

  // Use React Query to fetch users with pagination
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery<UsersResponse>({
    queryKey: ["users", queryParams], // Include all query params in the key
    queryFn: () => fetchUsers(queryParams),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const handleUserModalToggle = () => {
    dispatch(toggleUserModal());
  };

  const handleSearch = () => {
    search();
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-kr-maroon-dark">Users</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-kr-maroon" />
            <span className="ml-2 text-lg">Loading users...</span>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-kr-maroon-dark">Users</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 mb-4">
              Failed to load users. Please try again.
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-kr-maroon hover:bg-kr-maroon-dark"
            >
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const users = usersData?.data || [];
  const totalUsers = parseInt(usersData?.total || "0");

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-kr-maroon-dark">Users</h1>
            {totalUsers > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {hasActiveSearch ? (
                  <>
                    Showing search results for "{searchQuery}" ({totalUsers}{" "}
                    found)
                  </>
                ) : (
                  <>Total: {totalUsers} users</>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
            <div className="relative flex w-full max-w-sm md:max-w-xs">
              <Input
                type="search"
                placeholder="Search user by payroll number or name..."
                className="flex-1 pr-20"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <div className="absolute right-0 top-0 h-full flex">
                {hasActiveSearch && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-full rounded-none text-gray-400 hover:text-gray-600"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  className="h-full rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
                  onClick={handleSearch}
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleUserModalToggle}
              className="bg-kr-maroon hover:bg-kr-maroon-dark whitespace-nowrap"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid gap-4 md:hidden">
          {users.length > 0 ? (
            users.map((user: User) => {
              // Transform user data to match UserCard expected format
              const transformedUser = {
                ...user,
                role: (user.role.charAt(0).toUpperCase() +
                  user.role.slice(1)) as "Admin" | "Keeper" | "Viewer",
              };
              return (
                <UserCard key={user.payrollNumber} user={transformedUser} />
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-2">
                {hasActiveSearch
                  ? "No users found matching your search"
                  : "No users found"}
              </p>
              {hasActiveSearch && (
                <Button
                  variant="outline"
                  onClick={handleClearSearch}
                  className="text-kr-maroon border-kr-maroon hover:bg-kr-maroon hover:text-white"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-kr-maroon text-white hover:bg-kr-maroon">
                <TableHead className="text-white">Payroll Number</TableHead>
                <TableHead className="text-white">First Name</TableHead>
                <TableHead className="text-white">Last Name</TableHead>
                <TableHead className="text-white">Role</TableHead>
                <TableHead className="text-white">Default Location</TableHead>
                <TableHead className="text-white">
                  Must Change Password
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user: User) => (
                  <TableRow key={user.payrollNumber}>
                    <TableCell className="font-medium">
                      {user.payrollNumber}
                    </TableCell>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${getRoleColor(user.role)} px-2 py-1 rounded-full text-xs`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.defaultLocation ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {user.defaultLocation.departmentName}
                          </div>
                          <div className="text-gray-500">
                            {user.defaultLocation.regionName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          No location assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.mustChangePassword
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.mustChangePassword ? "Required" : "Not Required"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-muted-foreground text-lg">
                        {hasActiveSearch
                          ? "No users found matching your search"
                          : "No users found"}
                      </p>
                      {hasActiveSearch && (
                        <Button
                          variant="outline"
                          onClick={handleClearSearch}
                          className="text-kr-maroon border-kr-maroon hover:bg-kr-maroon hover:text-white"
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {usersData && usersData.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={usersData.totalPages}
              onPageChange={handlePageChange}
            />

            {/* Pagination Info */}
            <div className="text-center text-sm text-muted-foreground mt-4">
              Showing {(currentPage - 1) * queryParams.limit + 1} to{" "}
              {Math.min(currentPage * queryParams.limit, totalUsers)} of{" "}
              {totalUsers} users
              {hasActiveSearch && (
                <span className="ml-2">(filtered by "{searchQuery}")</span>
              )}
            </div>
          </div>
        )}

        {/* Modal */}
        {isUserModalOpen && <CreateUserModal />}
      </main>
    </div>
  );
}
