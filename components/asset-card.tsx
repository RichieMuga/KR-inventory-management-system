import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, User, Package, Hash, CheckCircle, XCircle, Wrench, Truck } from "lucide-react"

interface AssetCardProps {
  asset: {
    id: string
    name: string
    serialNumber?: string // Make serialNumber optional
    region: string
    availability: "Available" | "Assigned" | "In Repair" | "Disposed"
    location: string
    keeper: string
    isBulk: boolean
    quantity?: number
  }
}

export function AssetCard({ asset }: AssetCardProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-green-100 text-green-800"
      case "Assigned":
        return "bg-kr-orange-dark text-white"
      case "In Repair":
        return "bg-kr-yellow-dark text-white"
      case "Disposed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case "Available":
        return <CheckCircle className="h-4 w-4 mr-1" />
      case "Assigned":
        return <User className="h-4 w-4 mr-1" />
      case "In Repair":
        return <Wrench className="h-4 w-4 mr-1" />
      case "Disposed":
        return <XCircle className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{asset.name}</CardTitle>
        <Badge
          className={`${getAvailabilityColor(asset.availability)} px-2 py-1 rounded-full text-xs flex items-center`}
        >
          {getAvailabilityIcon(asset.availability)}
          {asset.availability}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center">
          <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Serial Number:</span>
          <span className="ml-auto font-medium">{asset.serialNumber || "N/A"}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Location:</span>
          <span className="ml-auto font-medium">{asset.location}</span>
        </div>
        <div className="flex items-center">
          <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Region:</span>
          <span className="ml-auto font-medium">{asset.region}</span>
        </div>
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Keeper:</span>
          <span className="ml-auto font-medium">{asset.keeper}</span>
        </div>
        {asset.isBulk && (
          <div className="flex items-center">
            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Quantity:</span>
            <span className="ml-auto font-medium">{asset.quantity || 0}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
