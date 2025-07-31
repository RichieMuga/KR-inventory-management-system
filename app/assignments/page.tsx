import { AssignmentCard } from "@/components/assignment-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const MOCK_ASSIGNMENTS = [
  {
    id: "1",
    assetName: "HP Laptop Pro",
    serialNumber: "HP-PRO-001",
    assignedTo: "John Doe",
    assignmentDate: "2023-01-15",
    returnDate: "2024-01-15",
    status: "Active",
  },
  {
    id: "2",
    assetName: "Projector Epson",
    serialNumber: "EPS-PROJ-002",
    assignedTo: "Jane Smith",
    assignmentDate: "2023-03-01",
    returnDate: "2024-03-01",
    status: "Active",
  },
  {
    id: "3",
    assetName: "Wireless Mouse",
    serialNumber: "LOGI-MSE-003",
    assignedTo: "Peter Jones",
    assignmentDate: "2023-05-20",
    returnDate: "2023-11-20",
    status: "Returned",
  },
  {
    id: "4",
    assetName: "Monitor Dell 24-inch",
    serialNumber: "DELL-MON-004",
    assignedTo: "Alice Brown",
    assignmentDate: "2023-07-10",
    returnDate: "2024-07-10",
    status: "Active",
  },
  {
    id: "5",
    assetName: "Network Cable (CAT6)",
    serialNumber: "NET-CAB-005",
    assignedTo: "David Green",
    assignmentDate: "2023-09-01",
    returnDate: "2024-09-01",
    status: "Active",
  },
]

export default function AssignmentsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">Asset Assignments</h1>
        <div className="relative flex w-full max-w-sm md:max-w-xs">
          <Input
            type="search"
            placeholder="Search assignments..."
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
        {MOCK_ASSIGNMENTS.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  )
}
