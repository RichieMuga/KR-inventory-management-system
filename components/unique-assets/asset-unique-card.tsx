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
  Calendar,
} from "lucide-react";
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
    keeperName: string | null;
    isBulk: boolean;
    quantity?: number | null;
    // Additional fields that might be available from the API
    modelNumber?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    locationNotes?: string;
    fullLocationInfo?: {
      locationId: number;
      regionName: string;
      departmentName: string;
      notes?: string;
    };
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

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 border-l-kr-maroon/20 hover:border-l-kr-maroon">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-kr-maroon-dark line-clamp-1">
            {asset.name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={availabilityColor[asset.availability]}>
              {asset.availability}
            </Badge>
            {asset.isBulk &&
              asset.quantity !== null &&
              asset.quantity !== undefined && (
                <Badge variant="outline" className="text-xs">
                  Qty: {asset.quantity}
                </Badge>
              )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {/* Serial Number */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
          <Tag className="h-4 w-4 text-kr-maroon flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-muted-foreground text-xs block">
              Serial Number
            </span>
            <span className="font-mono text-sm font-medium truncate block">
              {asset.serialNumber}
            </span>
          </div>
        </div>

        {/* Location & Region */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-muted-foreground text-xs block">
                Department
              </span>
              <span className="font-medium truncate block">
                {asset.location}
              </span>
            </div>
          </div>

          {asset.region !== "Unknown Region" && (
            <div className="flex items-center gap-2 ml-6">
              <span className="text-muted-foreground text-xs">Region:</span>
              <span className="text-sm font-medium text-kr-maroon-dark">
                {asset.region}
              </span>
            </div>
          )}
        </div>

        {/* Keeper */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-muted-foreground text-xs block">Keeper</span>
            <span className="font-medium truncate block">{asset.keeperName}</span>
          </div>
        </div>

        {/* Model Number */}
        {asset.modelNumber && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-muted-foreground text-xs block">Model</span>
              <span className="font-medium truncate block">
                {asset.modelNumber}
              </span>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {asset.updatedAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>Updated: {formatDate(asset.updatedAt)}</span>
          </div>
        )}

        {/* Notes */}
        {asset.notes && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
            <span className="text-muted-foreground text-xs block mb-1">
              Asset Notes:
            </span>
            <p className="text-sm text-blue-900 line-clamp-2">{asset.notes}</p>
          </div>
        )}

        {/* Location Notes */}
        {asset.locationNotes && (
          <div className="mt-2 p-2 bg-amber-50 rounded-md border border-amber-100">
            <span className="text-muted-foreground text-xs block mb-1">
              Location Notes:
            </span>
            <p className="text-sm text-amber-900 line-clamp-1">
              {asset.locationNotes}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t border-gray-100">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAsset}
                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent transition-colors"
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
                className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50 bg-transparent transition-colors"
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
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent transition-colors"
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
