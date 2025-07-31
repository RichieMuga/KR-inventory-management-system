import { Header } from "@/components/layout/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserCard } from "@/components/user-card" // Import the new card component
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  assetsAssigned: number
}

const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "IT Manager",
    department: "IT",
    assetsAssigned: 15,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Software Engineer",
    department: "Engineering",
    assetsAssigned: 8,
  },
  {
    id: "3",
    name: "Peter Jones",
    email: "peter.jones@example.com",
    role: "Network Administrator",
    department: "IT",
    assetsAssigned: 10,
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    role: "HR Manager",
    department: "Human Resources",
    assetsAssigned: 3,
  },
  {
    id: "5",
    name: "David Green",
    email: "david.green@example.com",
    role: "Sales Executive",
    department: "Sales",
    assetsAssigned: 5,
  },
]

export default function UsersPage() {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-kr-maroon-dark text-white"
      case "Keeper":
        return "bg-kr-orange-dark text-white"
      case "Viewer":
        return "bg-gray-200 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-kr-maroon-dark">System Users</h1>
          <div className="relative flex w-full max-w-sm md:max-w-xs">
            <Input
              type="search"
              placeholder="Search users..."
              className="flex-1 pr-10" // Add padding for the button
            />
            <Button
              type="button"
              size="icon"
              className="absolute right-0 top-0 h-full rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid gap-4 md:hidden">
          {MOCK_USERS.length > 0 ? (
            MOCK_USERS.map((user) => <UserCard key={user.id} user={user} />)
          ) : (
            <p className="text-center text-muted-foreground">No users found.</p>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-kr-maroon text-white hover:bg-kr-maroon">
                <TableHead className="text-white">ID</TableHead>
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Email</TableHead>
                <TableHead className="text-white">Role</TableHead>
                <TableHead className="text-white">Department</TableHead>
                <TableHead className="text-white">Assets Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={`${getRoleColor(user.role)} px-2 py-1 rounded-full text-xs`}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.assetsAssigned}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
