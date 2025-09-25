"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

import { formatDate } from "@/lib/utility/transformDate";

// Import the dedicated table components
import BulkAssetsTable from "@/components/assignment/bulk/bulk-assets-table";
import UniqueAssetsResponsive from "@/components/assignment/unique/unique-assets-responsive";

import ViewAssignmentDialog from "@/components/assignment/view-assignments";
import NewAssignmentDialog from "@/components/modals/assignment/create-new-assignment-modal";
import Pagination from "@/components/pagination/pagination";

// Import the new delete dialog
import DeleteAssignmentDialog from "@/components/modals/assignment/delete-assignment-modal";

import { toggleUniqueAssignmentModal, toggleBulkAssignmentModal } from "@/lib/features/modals/assignment-modal";
import { RootState } from "@/lib/store";
import { useSelector, useDispatch } from "react-redux";
import { api } from "@/lib/api/axiosInterceptor";

// Types
interface Assignment {
  assignmentId: number;
  assetId: number;
  assetName: string;
  serialNumber: string;
  isBulk: boolean;
  individualStatus: "in_use" | "returned" | "not_in_use";
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  dateIssued: string;
  conditionIssued: string;
  notes: string;
  quantity: number;
  locationName: string;
  quantityReturned: number;
  quantityRemaining: number;
  status: "active" | "inactive";
  dateReturned: string | null;
  conditionReturned: string | null;
}

interface StockLevel {
  assetId: number;
  name: string;
  currentStockLevel: number;
  minimumThreshold: number;
  lastRestocked: string;
  isLowStock: boolean;
  totalMovements: number;
  totalRestocked: number;
}

interface AssignmentsResponse {
  success: boolean;
  data: Assignment[];
  pagination: {
    page: number;
    limit: number;
    totalCount: string;
    totalPages: number;
  };
}

// API functions
const fetchAssignments = async (
  page: number = 1,
  limit: number = 10,
  type?: "bulk" | "unique",
  searchQuery?: string,
): Promise<AssignmentsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (type) {
    params.append("type", type);
  }

  if (searchQuery && searchQuery.trim()) {
    params.append("search", `?q=${searchQuery.trim()}`);
  }

  const response = await api.get(`/assignments?${params.toString()}`);
  return response.data;
};

const fetchStockLevels = async (assetIds: number[]): Promise<StockLevel[]> => {
  if (assetIds.length === 0) return [];
  
  try {
    const stockPromises = assetIds.map(async (assetId) => {
      try {
        const response = await api.get(`/stock-levels/${assetId}`);
        return response.data;
      } catch (error) {
        console.warn(`Failed to fetch stock for asset ${assetId}:`, error);
        return null;
      }
    });

    const stockResults = await Promise.allSettled(stockPromises);
    return stockResults
      .filter((result): result is PromiseFulfilledResult<StockLevel> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    return [];
  }
};

const deleteBulkAssignment = async (assignmentId: number, reason: string) => {
  const response = await api.post('/assignments/bulk-delete', {
    assignmentIds: [assignmentId],
    reason: reason
  });
  return response.data;
};

const deleteUniqueAssignment = async (assignmentId: number) => {
  const response = await api.delete(`/assignments/${assignmentId}`);
  return response.data;
};

// Transform API data
const transformAssignment = (apiAssignment: Assignment, stockLevel?: StockLevel) => ({
  id: String(apiAssignment.assignmentId).padStart(3, "0"),
  assignmentId: apiAssignment.assignmentId,
  assetId: apiAssignment.assetId,
  assetName: apiAssignment.assetName,
  assetType: apiAssignment.isBulk ? "bulk" : ("unique" as "bulk" | "unique"),
  serialNumber: apiAssignment.serialNumber,
  assignedTo: apiAssignment.assignedToName,
  assignedToId: apiAssignment.assignedTo,
  assignedBy: apiAssignment.assignedByName,
  assignedById: apiAssignment.assignedBy,
  dateIssued: formatDate(apiAssignment.dateIssued),
  conditionIssued: apiAssignment.conditionIssued,
  locationName: apiAssignment.locationName,
  status:
    apiAssignment.individualStatus === "in_use"
      ? "In use"
      : apiAssignment.individualStatus === "returned"
        ? "Returned"
        : apiAssignment.status === "active"
          ? "In use"
          : "Not in use",
  notes: apiAssignment.notes,
  quantityIssued: apiAssignment.quantity,
  quantityReturned: apiAssignment.quantityReturned,
  quantityRemaining: apiAssignment.quantityRemaining,
  dateReturned: formatDate(apiAssignment.dateReturned),
  conditionReturned: apiAssignment.conditionReturned,
  batchNumber: apiAssignment.serialNumber || `BATCH-${apiAssignment.assignmentId}`,
  currentStockLevel: stockLevel?.currentStockLevel || 0,
  minimumThreshold: stockLevel?.minimumThreshold || 0,
  isLowStock: stockLevel?.isLowStock || false,
  lastRestocked: stockLevel?.lastRestocked ? formatDate(stockLevel.lastRestocked) : null,
});

export default function AssetAssignments() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { isBulkAssignmentModalOpen, isUniqueAssignmentModalOpen } = useSelector(
    (state: RootState) => state.assignmentModal,
  );
  
  const [activeTab, setActiveTab] = useState<"bulk" | "unique">("bulk");
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  // React Query - Bulk assignments
  const {
    data: bulkAssignmentsData,
    isLoading: bulkAssignmentsLoading,
    isError: bulkAssignmentsError,
    refetch: refetchBulkAssignments,
  } = useQuery({
    queryKey: ["bulkAssignments", currentPage, pageSize, searchQuery],
    queryFn: () => fetchAssignments(currentPage, pageSize, "bulk", searchQuery),
    enabled: activeTab === "bulk",
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // React Query - Unique assignments
  const {
    data: uniqueAssignmentsData,
    isLoading: uniqueAssignmentsLoading,
    isError: uniqueAssignmentsError,
    refetch: refetchUniqueAssignments,
  } = useQuery({
    queryKey: ["uniqueAssignments", currentPage, pageSize, searchQuery],
    queryFn: () => fetchAssignments(currentPage, pageSize, "unique", searchQuery),
    enabled: activeTab === "unique",
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Stock levels query
  const bulkAssetIds = bulkAssignmentsData?.data?.map(a => a.assetId) || [];
  const {
    data: stockLevelsData,
    isLoading: stockLevelsLoading,
  } = useQuery({
    queryKey: ["stockLevels", bulkAssetIds],
    queryFn: () => fetchStockLevels(bulkAssetIds),
    enabled: activeTab === "bulk" && bulkAssetIds.length > 0,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  // Delete mutations
  const deleteBulkMutation = useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: number; reason: string }) =>
      deleteBulkAssignment(assignmentId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bulkAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["stockLevels"] });
      const result = data.results[0];
      toast({
        title: "Assignment Deleted Successfully",
        description: result.message,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting bulk assignment:", error);
      toast({
        title: "Error Deleting Assignment",
        description: error?.response?.data?.message || "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteUniqueMutation = useMutation({
    mutationFn: (assignmentId: number) => deleteUniqueAssignment(assignmentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["uniqueAssignments"] });
      toast({
        title: "Assignment Deleted Successfully",
        description: data.message,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting unique assignment:", error);
      toast({
        title: "Error Deleting Assignment",
        description: error?.response?.data?.message || "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Transform data
  const stockLevelsMap = new Map(stockLevelsData?.map(stock => [stock.assetId, stock]) || []);
  const bulkAssignments = bulkAssignmentsData?.data?.map(assignment => 
    transformAssignment(assignment, stockLevelsMap.get(assignment.assetId))
  ) || [];
  const uniqueAssignments = uniqueAssignmentsData?.data?.map(transformAssignment) || [];
  const assignments = [...bulkAssignments, ...uniqueAssignments];

  // Effects
  useEffect(() => {
    setInputValue("");
    setSearchQuery("");
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery !== "") {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Handlers
  const filteredAssignments = activeTab === "bulk" ? bulkAssignments : uniqueAssignments;

  const handleSearch = () => {
    setSearchQuery(inputValue);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleView = (assignment: any) => {
    setSelectedAssignment(assignment);
    setViewDialogOpen(true);
  };

  const handleNewAssignment = () => {
    if (activeTab === "bulk") {
      dispatch(toggleBulkAssignmentModal());
    } else {
      dispatch(toggleUniqueAssignmentModal());
    }
  };

  const handleSaveAssignment = (newAssignment: any) => {
    if (newAssignment.assetType === "bulk") {
      refetchBulkAssignments();
    } else {
      refetchUniqueAssignments();
    }
  };

  const handleDelete = (assignment: any) => {
    setSelectedAssignment(assignment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async (assignment: any, reason?: string) => {
    if (!assignment) return;

    try {
      const assignmentId = assignment.assignmentId || parseInt(assignment.id);

      if (assignment.assetType === "bulk") {
        if (!reason || reason.trim().length === 0) {
          toast({
            title: "Reason Required",
            description: "A deletion reason is required for bulk assignments.",
            variant: "destructive",
          });
          return;
        }
        await deleteBulkMutation.mutateAsync({ assignmentId, reason });
      } else {
        await deleteUniqueMutation.mutateAsync(assignmentId);
      }
    } catch (error) {
      // Error handling in mutation callbacks
    }
  };

  const handleCloseAssignmentModal = () => {
    if (activeTab === "bulk" && isBulkAssignmentModalOpen) {
      dispatch(toggleBulkAssignmentModal());
    } else if (activeTab === "unique" && isUniqueAssignmentModalOpen) {
      dispatch(toggleUniqueAssignmentModal());
    }
  };

  const getNextId = () => {
    const maxId = Math.max(
      ...assignments.map((a) => {
        const idNum = parseInt(a.id.toString().split("-")[1]) || parseInt(a.id.toString()) || 0;
        return idNum;
      }),
      0,
    );
    return `ASG-${String(maxId + 1).padStart(3, "0")}`;
  };

  const getSearchPlaceholder = () => {
    return activeTab === "bulk"
      ? "Search by asset name, assignee, or batch..."
      : "Search by asset name, serial, or assignee...";
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const isAssignmentModalOpen = 
    (activeTab === "bulk" && isBulkAssignmentModalOpen) || 
    (activeTab === "unique" && isUniqueAssignmentModalOpen);

  const lowStockCount = bulkAssignments.filter(a => a.isLowStock).length;
  const totalCurrentStock = bulkAssignments.reduce((sum, a) => sum + a.currentStockLevel, 0);
  const averageStockLevel = bulkAssignments.length > 0 
    ? Math.round(totalCurrentStock / bulkAssignments.length) 
    : 0;

  const isDeleting = deleteBulkMutation.isPending || deleteUniqueMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 mx-4 gap-6">
          <div className="px-4 mt-4 text-center md:text-left">
            <h1 className="md:text-3xl text-lg font-bold text-gray-900">
              Asset Assignments
            </h1>
            <p className="text-gray-600 mt-2">
              Track asset assignments and verify responsibility across your organization
            </p>
          </div>
          <Button
            onClick={handleNewAssignment}
            className="bg-kr-maroon hover:bg-kr-maroon-dark text-white px-6 py-2 rounded-lg shadow-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mx-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "bulk" | "unique")}>
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger
                  value="bulk"
                  className="data-[state=active]:bg-kr-maroon data-[state=active]:text-white"
                >
                  Bulk Assets ({bulkAssignments.length})
                  {(bulkAssignmentsLoading || stockLevelsLoading) && (
                    <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="unique"
                  className="data-[state=active]:bg-kr-maroon data-[state=active]:text-white"
                >
                  Unique Assets ({uniqueAssignments.length})
                  {uniqueAssignmentsLoading && (
                    <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Bulk Assets Tab */}
            <TabsContent value="bulk" className="p-6">
              {(bulkAssignmentsLoading || stockLevelsLoading) && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading bulk assignments and stock levels...</span>
                </div>
              )}

              {bulkAssignmentsError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Error loading bulk assignments.
                    <button
                      onClick={() => refetchBulkAssignments()}
                      className="ml-2 text-red-600 underline hover:text-red-800"
                    >
                      Try again
                    </button>
                  </p>
                </div>
              )}

              {!bulkAssignmentsLoading && !stockLevelsLoading && (
                <div className="relative flex w-full max-w-sm md:max-w-md mb-6">
                  <Input
                    type="search"
                    placeholder={getSearchPlaceholder()}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="rounded-r-none"
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
                    onClick={handleSearch}
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  {inputValue && (
                    <button
                      type="button"
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                      onClick={handleClear}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {searchQuery && !bulkAssignmentsLoading && !stockLevelsLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Found <strong>{filteredAssignments.length}</strong> bulk assignments matching "{searchQuery}"
                    <button onClick={handleClear} className="ml-2 text-blue-600 underline hover:text-blue-800">
                      Clear search
                    </button>
                  </p>
                </div>
              )}

              {!bulkAssignmentsLoading && !stockLevelsLoading && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {bulkAssignments.filter((a) => a.status === "In use").length}
                      </p>
                      <p className="text-sm text-gray-600">In Use</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {bulkAssignments.filter((a) => a.status === "Returned").length}
                      </p>
                      <p className="text-sm text-gray-600">Returned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{totalCurrentStock}</p>
                      <p className="text-sm text-gray-600">Current Stock</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {lowStockCount}
                      </p>
                      <p className="text-sm text-gray-600">Low Stock Alerts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{averageStockLevel}</p>
                      <p className="text-sm text-gray-600">Avg Stock Level</p>
                    </div>
                  </div>
                </div>
              )}

              {!bulkAssignmentsLoading && !stockLevelsLoading && !bulkAssignmentsError && (
                <BulkAssetsTable
                  assignments={filteredAssignments}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              )}

              {!bulkAssignmentsLoading && !stockLevelsLoading && bulkAssignmentsData?.pagination && bulkAssignmentsData.pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={bulkAssignmentsData.pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </TabsContent>

            {/* Unique Assets Tab */}
            <TabsContent value="unique" className="p-6">
              {uniqueAssignmentsLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading unique assignments...</span>
                </div>
              )}

              {uniqueAssignmentsError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Error loading unique assignments.
                    <button
                      onClick={() => refetchUniqueAssignments()}
                      className="ml-2 text-red-600 underline hover:text-red-800"
                    >
                      Try again
                    </button>
                  </p>
                </div>
              )}

              {!uniqueAssignmentsLoading && (
                <div className="relative flex w-full max-w-sm md:max-w-md mb-6">
                  <Input
                    type="search"
                    placeholder={getSearchPlaceholder()}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="rounded-r-none"
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
                    onClick={handleSearch}
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  {inputValue && (
                    <button
                      type="button"
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                      onClick={handleClear}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {searchQuery && !uniqueAssignmentsLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Found <strong>{filteredAssignments.length}</strong> unique assignments matching "{searchQuery}"
                    <button onClick={handleClear} className="ml-2 text-blue-600 underline hover:text-blue-800">
                      Clear search
                    </button>
                  </p>
                </div>
              )}

              {!uniqueAssignmentsLoading && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{uniqueAssignments.length}</p>
                      <p className="text-sm text-gray-600">Total Unique Assets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {uniqueAssignments.filter((a) => a.status === "In use").length}
                      </p>
                      <p className="text-sm text-gray-600">Currently In Use</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {uniqueAssignments.filter((a) => a.status === "Returned").length}
                      </p>
                      <p className="text-sm text-gray-600">Returned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {uniqueAssignments.filter((a) => a.status === "Not in use").length}
                      </p>
                      <p className="text-sm text-gray-600">Not in Use</p>
                    </div>
                  </div>
                </div>
              )}

              {!uniqueAssignmentsLoading && !uniqueAssignmentsError && (
                <UniqueAssetsResponsive
                  assignments={filteredAssignments}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              )}

              {!uniqueAssignmentsLoading && uniqueAssignmentsData?.pagination && uniqueAssignmentsData.pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={uniqueAssignmentsData.pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogs */}
        <ViewAssignmentDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          assignment={selectedAssignment}
        />

        <NewAssignmentDialog
          open={isAssignmentModalOpen}
          onOpenChange={handleCloseAssignmentModal}
          assetType={activeTab}
          availableAssets={[]}
          onSave={handleSaveAssignment}
          nextId={getNextId()}
        />

        <DeleteAssignmentDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          assignment={selectedAssignment}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}