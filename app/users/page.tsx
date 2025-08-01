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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <h1 className="text-3xl font-bold text-kr-maroon-dark">System Users</h1>

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
    </div>
  );
}
