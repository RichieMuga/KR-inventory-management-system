import { LocationCard } from "@/components/location-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const MOCK_LOCATIONS = [
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
  {
    id: "5",
    name: "User Desk 101",
    region: "Mombasa",
    capacity: "Small",
    currentAssets: 1,
    lastUpdated: "2023-10-26",
  },
]

export default function LocationsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MOCK_LOCATIONS.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </div>
  )
}
