import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MovementCard } from "@/components/movement-card" // Import the new card component

interface Movement {
  id: string
  assetName: string
  fromLocation: string
  toLocation: string
  movedBy: string
  timestamp: string
  quantity: number
  notes?: string
}

const MOCK_MOVEMENTS: Movement[] = [
  {
    id: "M001",
    assetName: "HP Toner Cartridge (Black)",
    fromLocation: "IT Store Room A",
    toLocation: "Office 101",
    movedBy: "John Doe",
    timestamp: "2024-07-30 10:30 AM",
    quantity: 1,
    notes: "For printer in Office 101",
  },
  {
    id: "M002",
    assetName: "Network Cable (CAT6, 10m)",
    fromLocation: "Server Room 1",
    toLocation: "Office 205",
    movedBy: "Alice Brown",
    timestamp: "2024-07-29 02:15 PM",
    quantity: 2,
    notes: "New workstation setup",
  },
  {
    id: "M003",
    assetName: "24-inch Dell Monitor",
    fromLocation: "Office 302",
    toLocation: "Repair Workshop",
    movedBy: "Emily Davis",
    timestamp: "2024-07-28 11:00 AM",
    quantity: 1,
    notes: "Screen flickering issue",
  },
  {
    id: "M004",
    assetName: "USB Flash Drive (64GB)",
    fromLocation: "IT Store Room B",
    toLocation: "User Desk 101",
    movedBy: "David Green",
    timestamp: "2024-07-27 09:45 AM",
    quantity: 1,
    notes: "Issued to new employee",
  },
  {
    id: "M005",
    assetName: "Wireless Mouse (Logitech)",
    fromLocation: "IT Store Room A",
    toLocation: "Office 105",
    movedBy: "Sarah White",
    timestamp: "2024-07-26 03:00 PM",
    quantity: 1,
    notes: "Replacement for faulty mouse",
  },
]

export default function MovementsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <h1 className="text-3xl font-bold text-kr-maroon-dark">Inventory Movements</h1>

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
                <TableHead className="text-white">From Location</TableHead>
                <TableHead className="text-white">To Location</TableHead>
                <TableHead className="text-white">Moved By</TableHead>
                <TableHead className="text-white">Timestamp</TableHead>
                <TableHead className="text-white text-right">Quantity</TableHead>
                <TableHead className="text-white">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_MOVEMENTS.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{movement.assetName}</TableCell>
                  <TableCell>{movement.fromLocation}</TableCell>
                  <TableCell>{movement.toLocation}</TableCell>
                  <TableCell>{movement.movedBy}</TableCell>
                  <TableCell>{movement.timestamp}</TableCell>
                  <TableCell className="text-right">{movement.quantity}</TableCell>
                  <TableCell>{movement.notes || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
