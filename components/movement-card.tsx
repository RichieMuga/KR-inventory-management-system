import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calendar, Hash, MapPin, Tag, User } from "lucide-react"

interface MovementCardProps {
  movement: {
    id: string
    assetName: string
    serialNumber: string
    type: string
    fromLocation: string
    toLocation: string
    date: string
    movedBy: string
  }
}

export function MovementCard({ movement }: MovementCardProps) {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{movement.assetName}</CardTitle>
        <Tag className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center">
          <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Serial Number:</span>
          <span className="ml-auto font-medium">{movement.serialNumber}</span>
        </div>
        <div className="flex items-center">
          <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Type:</span>
          <span className="ml-auto font-medium">{movement.type}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">From:</span>
          <span className="ml-auto font-medium">{movement.fromLocation}</span>
        </div>
        <div className="flex items-center">
          <ArrowRight className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">To:</span>
          <span className="ml-auto font-medium">{movement.toLocation}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Date:</span>
          <span className="ml-auto font-medium">{movement.date}</span>
        </div>
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Moved By:</span>
          <span className="ml-auto font-medium">{movement.movedBy}</span>
        </div>
      </CardContent>
    </Card>
  )
}
