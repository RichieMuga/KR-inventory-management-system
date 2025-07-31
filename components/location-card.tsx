import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Building } from "lucide-react"

interface LocationCardProps {
  location: {
    id: string
    regionName: string
    departmentName: string
    notes?: string
  }
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-kr-maroon-dark">{location.departmentName}</CardTitle>
        <span className="text-sm text-muted-foreground">ID: {location.id}</span>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Region:</span> {location.regionName}
        </div>
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Department:</span> {location.departmentName}
        </div>
        {location.notes && <div className="text-xs text-muted-foreground mt-1">Notes: {location.notes}</div>}
      </CardContent>
    </Card>
  )
}
