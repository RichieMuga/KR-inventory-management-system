"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssetTableProps {
  assets: {
    id: string;
    name: string;
    serialNumber: string;
    region: string;
    availability: "Available" | "Assigned" | "In Repair" | "Disposed";
    location: string;
    keeper: string;
    isBulk: boolean;
    quantity?: number;
  }[];
}

export function AssetTable({ assets }: AssetTableProps) {
  const router = useRouter();

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Assigned":
        return "bg-kr-orange-dark text-white";
      case "In Repair":
        return "bg-kr-yellow-dark text-white";
      case "Disposed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewAsset = (assetId: string) => {
    router.push(`/viewAsset/${assetId}`);
  };

  const handleEditAsset = (assetId: string) => {
    router.push(`/editAsset/${assetId}`);
  };

  const handleDeleteAsset = (assetId: string) => {
    console.log("Delete asset:", assetId);
    // TODO: Implement delete asset functionality
    // You might want to show a confirmation dialog before deleting
  };

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
            <TableHead className="text-white text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.name}</TableCell>
              <TableCell>{asset.serialNumber}</TableCell>
              <TableCell>{asset.location}</TableCell>
              <TableCell>{asset.region}</TableCell>
              <TableCell>{asset.keeper}</TableCell>
              <TableCell>
                <Badge
                  className={`${getAvailabilityColor(asset.availability)} px-2 py-1 rounded-full text-xs`}
                >
                  {asset.availability}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {asset.isBulk ? asset.quantity : "N/A"}
              </TableCell>
              <TableCell className="text-center">
                <TooltipProvider>
                  <div className="flex items-center justify-center gap-2">
                    {/* Desktop: Individual buttons */}
                    <div className="hidden lg:flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAsset(asset.id)}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View asset details</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAsset(asset.id)}
                            className="h-8 w-8 p-0 hover:bg-yellow-100"
                          >
                            <Edit className="h-4 w-4 text-yellow-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit asset information</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="h-8 w-8 p-0 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete asset permanently</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Mobile/Tablet: Dropdown menu */}
                    <div className="lg:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewAsset(asset.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Asset
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditAsset(asset.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Asset
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Asset
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
