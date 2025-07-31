"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag, MapPin, User, Package, Edit } from "lucide-react" // Import Edit icon
import { Button } from "@/components/ui/button" // Import Button

interface AssetCardProps {
  asset: {
    id: string
    name: string
    serialNumber: string
    region: string
    availability: "Available" | "Assigned" | "In Repair" | "Disposed"
    location: string
    keeper: string
    isBulk: boolean
    quantity?: number
  }
  onEdit: (asset: AssetCardProps["asset"]) => void // Add onEdit prop
}

export function AssetCard({ asset, onEdit }: AssetCardProps) {
  const availabilityColor = {
    Available: "bg-green-100 text-green-800",
    Assigned: "bg-kr-orange-dark text-white",
    "In Repair": "bg-yellow-100 text-yellow-800",
    Disposed: "bg-red-100 text-red-800",
  }

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-kr-maroon-dark">{asset.name}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={`${availabilityColor[asset.availability]} px-2 py-1 rounded-full text-xs`}>
            {asset.availability}
          </Badge>
          <Button variant="ghost" size="icon" onClick={() => onEdit(asset)} className="h-6 w-6">
            <Edit className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Edit Asset</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Serial:</span> {asset.serialNumber}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Location:</span> {asset.location}, {asset.region}
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Keeper:</span> {asset.keeper}
        </div>
        {asset.isBulk && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Quantity:</span> {asset.quantity}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
