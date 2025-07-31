import { UserCard } from "@/components/user-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const MOCK_USERS = [
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
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">System Users</h1>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MOCK_USERS.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}
