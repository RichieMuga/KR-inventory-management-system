import { Header } from "@/components/layout/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MovementCard } from "@/components/movement-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Movement {
  id: string
  assetName: string
  serialNumber: string
  type: string
  fromLocation: string
  toLocation: string
  date: string
  movedBy: string
}

const MOCK_MOVEMENTS: Movement[] = [
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
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-kr-maroon-dark">Inventory Movements</h1>
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

        {/* Mobile View: Cards */}
        <div className="grid gap-4 md:hidden">
          {MOCK_MOVEMENTS.length > 0 ? (
            MOCK_MOVEMENTS.map((movement) => <MovementCard key={movement.id} movement={movement} />)
          ) : (
            <p className="text-center text-muted-foreground">No movements found.</p>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-kr-maroon text-white hover:bg-kr-maroon">
                <TableHead className="text-white">Asset Name</TableHead>
                <TableHead className="text-white">Serial Number</TableHead>
                <TableHead className="text-white">Type</TableHead>
                <TableHead className="text-white">From Location</TableHead>
                <TableHead className="text-white">To Location</TableHead>
                <TableHead className="text-white">Moved By</TableHead>
                <TableHead className="text-white">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_MOVEMENTS.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{movement.assetName}</TableCell>
                  <TableCell>{movement.serialNumber}</TableCell>
                  <TableCell>{movement.type}</TableCell>
                  <TableCell>{movement.fromLocation}</TableCell>
                  <TableCell>{movement.toLocation}</TableCell>
                  <TableCell>{movement.movedBy}</TableCell>
                  <TableCell>{movement.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
