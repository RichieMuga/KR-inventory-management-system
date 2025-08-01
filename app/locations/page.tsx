import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LocationCard } from "@/components/location-card" // Import the new card component

interface Location {
  id: string
  regionName: string
  departmentName: string
  notes?: string
}

const MOCK_LOCATIONS: Location[] = [
  { id: "L001", regionName: "Nairobi", departmentName: "IT Store Room A", notes: "Main IT storage" },
  { id: "L002", regionName: "Nairobi", departmentName: "IT Store Room B", notes: "Secondary IT storage" },
  { id: "L003", regionName: "Nairobi", departmentName: "Server Room 1", notes: "Primary data center" },
  { id: "L004", regionName: "Nairobi", departmentName: "Server Room 2", notes: "Secondary data center" },
  { id: "L005", regionName: "Nairobi", departmentName: "Office 101", notes: "General office space" },
  { id: "L006", regionName: "Mombasa", departmentName: "Workshop 3", notes: "Repair and maintenance workshop" },
  { id: "L007", regionName: "Mombasa", departmentName: "Conference Room 3", notes: "Meeting room" },
  { id: "L008", regionName: "Kisumu", departmentName: "Tool Crib", notes: "Tools and small equipment storage" },
  { id: "L009", regionName: "Kisumu", departmentName: "Training Room", notes: "Employee training facility" },
  { id: "L010", regionName: "Kisumu", departmentName: "Scrap Yard", notes: "Disposed assets area" },
]

export default function LocationsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <h1 className="text-3xl font-bold text-kr-maroon-dark">Inventory Locations</h1>

        {/* Mobile View: Cards */}
        <div className="grid gap-4 md:hidden">
          {MOCK_LOCATIONS.length > 0 ? (
            MOCK_LOCATIONS.map((location) => <LocationCard key={location.id} location={location} />)
          ) : (
            <p className="text-center text-muted-foreground">No locations found.</p>
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
    </div>
  )
}
