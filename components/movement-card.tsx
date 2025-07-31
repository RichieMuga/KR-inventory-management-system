import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calendar, MapPin, User } from "lucide-react"

interface MovementCardProps {
  movement: {
    id: string
    assetName: string
    fromLocation: string
    toLocation: string
    movedBy: string
    timestamp: string
    quantity: number
    notes?: string
  }
}

export function MovementCard({ movement }: MovementCardProps) {
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-kr-maroon-dark">{movement.assetName}</CardTitle>
        <span className="text-sm text-muted-foreground">Qty: {movement.quantity}</span>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">From:</span> {movement.fromLocation}
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">To:</span> {movement.toLocation}
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Moved By:</span> {movement.movedBy}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">When:</span> {movement.timestamp}
        </div>
        {movement.notes && <div className="text-xs text-muted-foreground mt-1">Notes: {movement.notes}</div>}
      </CardContent>
    </Card>
  )
}
