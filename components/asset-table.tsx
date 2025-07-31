import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface AssetTableProps {
  assets: {
    id: string
    name: string
    serialNumber?: string // Make serialNumber optional
    region: string
    availability: "Available" | "Assigned" | "In Repair" | "Disposed"
    location: string
    keeper: string
    isBulk: boolean
    quantity?: number
  }[]
}

export function AssetTable({ assets }: AssetTableProps) {
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

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-kr-maroon text-white hover:bg-kr-maroon">
            <TableHead className="text-white">Asset Name</TableHead>
            <TableHead className="text-white">Serial Number</TableHead>
            <TableHead className="text-white">Location</TableHead>
            <TableHead className="text-white">Region</TableHead>
            <TableHead className="text-white">Keeper</TableHead>
            <TableHead className="text-white">Availability</TableHead>
            <TableHead className="text-white text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.name}</TableCell>
              <TableCell>{asset.serialNumber || "N/A"}</TableCell>
              <TableCell>{asset.location}</TableCell>
              <TableCell>{asset.region}</TableCell>
              <TableCell>{asset.keeper}</TableCell>
              <TableCell>
                <Badge className={`${getAvailabilityColor(asset.availability)} px-2 py-1 rounded-full text-xs`}>
                  {asset.availability}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{asset.isBulk ? asset.quantity || 0 : "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
