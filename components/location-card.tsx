import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Package, Calendar, Maximize2 } from "lucide-react"

interface LocationCardProps {
  location: {
    id: string
    name: string
    region: string
    capacity: string
    currentAssets: number
    lastUpdated: string
  }
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{location.name}</CardTitle>
        <MapPin className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Region:</span>
          <span className="ml-auto font-medium">{location.region}</span>
        </div>
        <div className="flex items-center">
          <Maximize2 className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Capacity:</span>
          <span className="ml-auto font-medium">{location.capacity}</span>
        </div>
        <div className="flex items-center">
          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Current Assets:</span>
          <span className="ml-auto font-medium">{location.currentAssets}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Last Updated:</span>
          <span className="ml-auto font-medium">{location.lastUpdated}</span>
        </div>
      </CardContent>
    </Card>
  )
}
