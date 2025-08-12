"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AssignmentTable from "@/components/assignment/assignment-table";
import ViewAssignmentDialog from "@/components/assignment/view-assignments";
import NewAssignmentDialog from "@/components/assignment/new-assignment-dialogue";
import DeleteConfirmationDialog from "@/components/assignment/delete-assignment-dialogue";
import Pagination from "@/components/pagination/pagination";

import { Assignment } from "@/types/assignment";
import {
  initialAssignments,
  availableBulkAssets,
  availableUniqueAssets,
} from "@/lib/mockData/assignments";

export default function AssetAssignments() {
  // Assignments data
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);

  // Tab state
  const [activeTab, setActiveTab] = useState<"bulk" | "unique">("bulk");

  // Search state
  const [inputValue, setInputValue] = useState(""); // input field
  const [searchQuery, setSearchQuery] = useState(""); // actual filter

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  // Reset search when switching tabs
  useEffect(() => {
    setInputValue("");
    setSearchQuery("");
  }, [activeTab]);

  // Filtered assignments: by tab + searchQuery (only when button clicked)
  const filteredAssignments = assignments
    .filter((assignment) => {
      if (activeTab === "bulk") return assignment.assetType === "bulk";
      if (activeTab === "unique") return assignment.assetType === "unique";
      return true;
    })
    .filter((assignment) => {
      if (searchQuery) {
        return assignment.assetName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      return true;
    });

  // Handle search button click
  const handleSearch = () => {
    setSearchQuery(inputValue);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
  };

  // Dialog handlers
  const handleView = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setViewDialogOpen(true);
  };

  const handleNewAssignment = () => {
    setAssignDialogOpen(true);
  };

  const handleSaveAssignment = (newAssignment: Assignment) => {
    setAssignments((prev) => [...prev, newAssignment]);
  };

  const handleDelete = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAssignment) {
      setAssignments((prev) =>
        prev.filter((a) => a.id !== selectedAssignment.id),
      );
      setSelectedAssignment(null);
    }
  };

  // Get available assets for new assignment dialog
  const getAvailableAssets = () => {
    return activeTab === "bulk" ? availableBulkAssets : availableUniqueAssets;
  };

  // Generate next assignment ID
  const getNextId = () => {
    const maxId = Math.max(
      ...assignments.map((a) => parseInt(a.id.split("-")[1]) || 0),
      0,
    );
    return `ASG-${String(maxId + 1).padStart(3, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 mx-4 gap-6">
          <div className="px-4 text-center md:text-left">
            <h1 className="md:text-3xl text-lg font-bold text-gray-900">
              Asset Assignments
            </h1>
            <p className="text-gray-600 mt-2">
              Track asset assignments and verify responsibility across your
              organization
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
        <div className="bg-white rounded-lg shadow-sm border">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "bulk" | "unique")}
          >
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger
                  value="bulk"
                  className="data-[state=active]:bg-kr-maroon data-[state=active]:text-white"
                >
                  Bulk Assets (
                  {assignments.filter((a) => a.assetType === "bulk").length})
                </TabsTrigger>
                <TabsTrigger
                  value="unique"
                  className="data-[state=active]:bg-kr-maroon data-[state=active]:text-white"
                >
                  Unique Assets (
                  {assignments.filter((a) => a.assetType === "unique").length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Bulk Assets Tab */}
            <TabsContent value="bulk" className="p-6">
              <div className="relative flex w-full max-w-sm md:max-w-xs mb-4">
                <Input
                  type="search"
                  placeholder="Search assets..."
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
                    className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                    onClick={handleClear}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <AssignmentTable
                assignments={filteredAssignments}
                onView={handleView}
                onDelete={handleDelete}
              />
            </TabsContent>

            {/* Unique Assets Tab */}
            <TabsContent value="unique" className="p-6">
              <div className="relative flex w-full max-w-sm md:max-w-xs mb-4">
                <Input
                  type="search"
                  placeholder="Search assets by name or serial..."
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
                    className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                    onClick={handleClear}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <AssignmentTable
                assignments={filteredAssignments}
                onView={handleView}
                onDelete={handleDelete}
              />
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
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          assetType={activeTab}
          availableAssets={getAvailableAssets()}
          onSave={handleSaveAssignment}
          nextId={getNextId()}
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          assignment={selectedAssignment}
          onConfirm={confirmDelete}
        />
      </div>

      {/* Pagination */}
      <Pagination />
    </div>
  );
}
