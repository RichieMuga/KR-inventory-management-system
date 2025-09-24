import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Building, Pencil, Trash2 } from "lucide-react"

interface LocationCardProps {
  location: {
    id: string
    regionName: string
    departmentName: string
    notes?: string
  }
  onEdit?: (location: LocationCardProps['location']) => void
  onDelete?: (location: LocationCardProps['location']) => void
}

export function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-kr-maroon-dark">
          {location.departmentName}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">ID: {location.id}</span>
          {/* Action buttons */}
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(location)}
                className="h-8 w-8 text-kr-orange hover:text-kr-orange-dark"
                aria-label="Edit location"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(location)}
                className="h-8 w-8 text-red-600 hover:text-red-700"
                aria-label="Delete location"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
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
        {location.notes && (
          <div className="text-xs text-muted-foreground mt-1">
            Notes: {location.notes}
          </div>
        )}
      </CardContent>
    </Card>
  )
}