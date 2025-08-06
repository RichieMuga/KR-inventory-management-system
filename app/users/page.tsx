"use client";

import { useDispatch, useSelector } from "react-redux";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCard } from "@/components/user-card"; // Import the new card component
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { toggleUserModal } from "@/lib/features/modals/user-creation-modal";
import { RootState } from "@/lib/store";
import CreateUserModal from "@/components/modals/user-creation-modal";
import Pagination from "@/components/pagination/pagination";

interface User {
  payrollNumber: string;
  firstName: string;
  lastName: string;
  role: "Admin" | "Keeper" | "Viewer";
}

const MOCK_USERS: User[] = [
  { payrollNumber: "P001", firstName: "John", lastName: "Doe", role: "Admin" },
  {
    payrollNumber: "P002",
    firstName: "Jane",
    lastName: "Smith",
    role: "Keeper",
  },
  {
    payrollNumber: "P003",
    firstName: "Peter",
    lastName: "Jones",
    role: "Keeper",
  },
  {
    payrollNumber: "P004",
    firstName: "Alice",
    lastName: "Brown",
    role: "Viewer",
  },
  {
    payrollNumber: "P005",
    firstName: "David",
    lastName: "Green",
    role: "Keeper",
  },
  {
    payrollNumber: "P006",
    firstName: "Sarah",
    lastName: "White",
    role: "Viewer",
  },
  {
    payrollNumber: "P007",
    firstName: "Michael",
    lastName: "Black",
    role: "Admin",
  },
  {
    payrollNumber: "P008",
    firstName: "Emily",
    lastName: "Davis",
    role: "Keeper",
  },
  {
    payrollNumber: "P009",
    firstName: "Chris",
    lastName: "Wilson",
    role: "Viewer",
  },
  {
    payrollNumber: "P010",
    firstName: "Olivia",
    lastName: "Taylor",
    role: "Keeper",
  },
];

export default function UsersPage() {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-kr-maroon-dark text-white";
      case "Keeper":
        return "bg-kr-orange-dark text-white";
      case "Viewer":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const dispatch = useDispatch();

  const { isUserModalOpen } = useSelector(
    (state: RootState) => state.userModal,
  );

  const handleUserModalToggle = () => {
    dispatch(toggleUserModal());
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
            onClick={handleUserModalToggle}
            className="bg-kr-maroon hover:bg-kr-maroon-dark"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid gap-4 md:hidden">
          {MOCK_USERS.length > 0 ? (
            MOCK_USERS.map((user) => (
              <UserCard key={user.payrollNumber} user={user} />
            ))
          ) : (
            <p className="text-center text-muted-foreground">No users found.</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((user) => (
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
                      {user.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      {isUserModalOpen && <CreateUserModal />}
      <Pagination />
    </div>
  );
}
