"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LocationCard } from "@/components/location-card"; // Import the new card component
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleLocationModal } from "@/lib/features/modals/location-modal";
import { RootState } from "@/lib/store";
import CreateLocationModal from "@/components/modals/create-location-modal";
import Pagination from "@/components/pagination/pagination";

interface Location {
  id: string;
  regionName: string;
  departmentName: string;
  notes?: string;
}

const MOCK_LOCATIONS: Location[] = [
  {
    id: "L001",
    regionName: "Nairobi",
    departmentName: "IT Store Room A",
    notes: "Main IT storage",
  },
  {
    id: "L002",
    regionName: "Nairobi",
    departmentName: "IT Store Room B",
    notes: "Secondary IT storage",
  },
  {
    id: "L003",
    regionName: "Nairobi",
    departmentName: "Server Room 1",
    notes: "Primary data center",
  },
  {
    id: "L004",
    regionName: "Nairobi",
    departmentName: "Server Room 2",
    notes: "Secondary data center",
  },
  {
    id: "L005",
    regionName: "Nairobi",
    departmentName: "Office 101",
    notes: "General office space",
  },
  {
    id: "L006",
    regionName: "Mombasa",
    departmentName: "Workshop 3",
    notes: "Repair and maintenance workshop",
  },
  {
    id: "L007",
    regionName: "Mombasa",
    departmentName: "Conference Room 3",
    notes: "Meeting room",
  },
  {
    id: "L008",
    regionName: "Kisumu",
    departmentName: "Tool Crib",
    notes: "Tools and small equipment storage",
  },
  {
    id: "L009",
    regionName: "Kisumu",
    departmentName: "Training Room",
    notes: "Employee training facility",
  },
  {
    id: "L010",
    regionName: "Kisumu",
    departmentName: "Scrap Yard",
    notes: "Disposed assets area",
  },
];

export default function LocationsPage() {
  const dispatch = useDispatch();
  const { isLocationModalOpen } = useSelector(
    (state: RootState) => state.locationModal,
  );

  function handleLocationModalToggle() {
    dispatch(toggleLocationModal());
  }
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 pt-4">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">Users</h1>
        <div className="relative flex w-full max-w-sm md:max-w-xs">
          <Input
            type="search"
            placeholder="Search user by payroll number or name..."
            className="flex-1 pr-10" // Add padding for the button
          />
          <Button
            type="button"
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
            onClick={() => console.log("Search asset")}
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
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        {/* Mobile View: Cards */}
        <div className="grid gap-4 md:hidden">
          {MOCK_LOCATIONS.length > 0 ? (
            MOCK_LOCATIONS.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No locations found.
            </p>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-kr-maroon text-white hover:bg-kr-maroon">
                <TableHead className="text-white">Location ID</TableHead>
                <TableHead className="text-white">Region</TableHead>
                <TableHead className="text-white">Department Name</TableHead>
                <TableHead className="text-white">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_LOCATIONS.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.id}</TableCell>
                  <TableCell>{location.regionName}</TableCell>
                  <TableCell>{location.departmentName}</TableCell>
                  <TableCell>{location.notes || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      <Pagination />
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
