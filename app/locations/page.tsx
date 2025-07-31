import { Header } from "@/components/layout/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LocationCard } from "@/components/location-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Location {
  id: string
  name: string
  region: string
  capacity: string
  currentAssets: number
  lastUpdated: string
}

const MOCK_LOCATIONS: Location[] = [
  {
    id: "1",
    name: "IT Store Room A",
    region: "Nairobi",
    capacity: "Large",
    currentAssets: 120,
    lastUpdated: "2023-10-26",
  },
  {
    id: "2",
    name: "Conference Room 3",
    region: "Mombasa",
    capacity: "Small",
    currentAssets: 5,
    lastUpdated: "2023-10-25",
  },
  {
    id: "3",
    name: "Server Room 1",
    region: "Nairobi",
    capacity: "Medium",
    currentAssets: 30,
    lastUpdated: "2023-10-27",
  },
  {
    id: "4",
    name: "Repair Workshop",
    region: "Kisumu",
    capacity: "Medium",
    currentAssets: 15,
    lastUpdated: "2023-10-24",
  },
  { id: "5", name: "User Desk 101", region: "Mombasa", capacity: "Small", currentAssets: 1, lastUpdated: "2023-10-26" },
]

export default function LocationsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-kr-maroon-dark">Asset Locations</h1>
          <div className="relative flex w-full max-w-sm md:max-w-xs">
            <Input
              type="search"
              placeholder="Search locations..."
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
                  <TableCell>{location.region}</TableCell>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>{location.capacity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
