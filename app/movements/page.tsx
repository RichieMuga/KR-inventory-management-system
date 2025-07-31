import { MovementCard } from "@/components/movement-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const MOCK_MOVEMENTS = [
  {
    id: "1",
    assetName: "HP Laptop Pro",
    serialNumber: "HP-PRO-001",
    type: "Assignment",
    fromLocation: "IT Store Room A",
    toLocation: "User Desk 101",
    date: "2023-10-26",
    movedBy: "John Doe",
  },
  {
    id: "2",
    assetName: "Projector Epson",
    serialNumber: "EPS-PROJ-002",
    type: "Relocation",
    fromLocation: "Conference Room 1",
    toLocation: "Training Room",
    date: "2023-10-25",
    movedBy: "Jane Smith",
  },
  {
    id: "3",
    assetName: "Toner Cartridge",
    serialNumber: "TONER-005",
    type: "Receipt",
    fromLocation: "Supplier",
    toLocation: "IT Store Room B",
    date: "2023-10-24",
    movedBy: "Peter Jones",
  },
  {
    id: "4",
    assetName: "Monitor Dell 24-inch",
    serialNumber: "DELL-MON-004",
    type: "Repair",
    fromLocation: "User Desk 105",
    toLocation: "Repair Workshop",
    date: "2023-10-23",
    movedBy: "Alice Brown",
  },
  {
    id: "5",
    assetName: "Network Cable (CAT6)",
    serialNumber: "NET-CAB-005",
    type: "Disposal",
    fromLocation: "Server Room 2",
    toLocation: "E-Waste Facility",
    date: "2023-10-22",
    movedBy: "David Green",
  },
]

export default function MovementsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">Asset Movements</h1>
        <div className="relative flex w-full max-w-sm md:max-w-xs">
          <Input
            type="search"
            placeholder="Search movements..."
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
        {MOCK_MOVEMENTS.map((movement) => (
          <MovementCard key={movement.id} movement={movement} />
        ))}
      </div>
    </div>
  )
}
