"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, MapPin, User, Package, Eye, Edit, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssetCardProps {
  asset: {
    id: string;
    name: string;
    serialNumber: string;
    region: string;
    availability: "Available" | "Assigned" | "In Repair" | "Disposed";
    location: string;
    keeper: string;
    isBulk: boolean;
    quantity?: number;
  };
}

export function AssetCard({ asset }: AssetCardProps) {
  const router = useRouter();

  const availabilityColor = {
    Available: "bg-green-100 text-green-800",
    Assigned: "bg-kr-orange-dark text-white",
    "In Repair": "bg-yellow-100 text-yellow-800",
    Disposed: "bg-red-100 text-red-800",
  };

  const handleViewAsset = () => {
    router.push(`/viewAsset/${asset.id}`);
  };

  const handleEditAsset = () => {
    router.push(`/editAsset/${asset.id}`);
  };

  const handleDeleteAsset = () => {
    console.log("Delete asset:", asset.id);
    // TODO: Implement delete asset functionality
    // You might want to show a confirmation dialog before deleting
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-kr-maroon-dark">
          {asset.name}
        </CardTitle>
        <Badge
          className={`${availabilityColor[asset.availability]} px-2 py-1 rounded-full text-xs`}
        >
          {asset.availability}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Serial:</span>{" "}
          {asset.serialNumber}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Location:</span>{" "}
          {asset.location}, {asset.region}
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Keeper:</span> {asset.keeper}
        </div>
        {asset.isBulk && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Quantity:</span>{" "}
            {asset.quantity}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAsset}
                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View detailed asset information</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditAsset}
                className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50 bg-transparent"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit asset information and details</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAsset}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete asset permanently</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
