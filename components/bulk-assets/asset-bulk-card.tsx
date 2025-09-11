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
import {
  Tag,
  MapPin,
  User,
  Package,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserNameDisplay } from "@/components/bulk-assets/user-name-display";

// Update your AssetCardProps interface
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
    locationId?: number;
    // Add any other properties you need for the card
  };
  lowQuantityThreshold?: number;
}

export function AssetCard({
  asset,
  lowQuantityThreshold = 10,
}: AssetCardProps) {
  const router = useRouter();

  // Determine if quantity is low for bulk assets
  const isLowQuantity =
    asset.isBulk &&
    asset.quantity !== undefined &&
    asset.quantity <= lowQuantityThreshold;

  // Format status for display
  const getStatusBadge = () => {
    const statusColors = {
      Available: "bg-green-100 text-green-800",
      Assigned: "bg-blue-100 text-blue-800",
      "In Repair": "bg-yellow-100 text-yellow-800",
      Disposed: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={
          statusColors[asset.availability as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {asset.availability}
      </Badge>
    );
  };

  const handleViewAsset = () => {
    router.push(`/view-bulk-asset/${asset.id}`);
  };

  const handleEditAsset = () => {
    router.push(`/edit-bulk-asset/${asset.id}`);
  };

  const handleDeleteAsset = () => {
    // TODO: Implement delete confirmation dialog
    console.log("Delete asset:", asset.id);
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-kr-maroon-dark mb-2">
            {asset.name}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge()}
            {asset.isBulk && (
              <Badge variant="outline" className="text-xs">
                Bulk Asset
              </Badge>
            )}
            {asset.isBulk && isLowQuantity && (
              <Badge className="bg-red-100 text-red-800 text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Low Stock
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 text-sm">
        {/* Serial Number */}
        {asset.serialNumber && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Serial:</span>
            <span className="font-mono text-xs">{asset.serialNumber}</span>
          </div>
        )}

        {/* Location - Only show department name, not region */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Location:</span>
          <span>{asset.location}</span>
        </div>

        {/* Keeper */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Keeper:</span>
          <UserNameDisplay
            payrollNumber={asset.keeper}
            maxLength={25}
            fallback="Unassigned"
            className="text-sm"
          />
        </div>

        {/* Bulk Asset Specific Information */}
        {asset.isBulk && asset.quantity !== undefined && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Stock Level:</span>
            <span
              className={
                isLowQuantity
                  ? "text-red-600 font-semibold"
                  : "text-gray-900 font-medium"
              }
            >
              {asset.quantity}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t">
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
