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
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
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
import { UserNameDisplay } from "./user-name-display";

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
  lowQuantityThreshold?: number; // Optional prop to define what's considered "low"
}

export function AssetTable({
  assets,
  lowQuantityThreshold = 10,
}: AssetTableProps) {
  const router = useRouter();

  const isLowQuantity = (asset: any) => {
    return (
      asset.isBulk &&
      asset.quantity !== undefined &&
      asset.quantity <= lowQuantityThreshold
    );
  };

  const isGoodQuantity = (asset: any) => {
    return (
      asset.isBulk &&
      asset.quantity !== undefined &&
      asset.quantity > lowQuantityThreshold
    );
  };

  const handleViewAsset = (assetId: string) => {
    router.push(`/view-bulk-asset/${assetId}`);
  };

  const handleEditAsset = (assetId: string) => {
    router.push(`/edit-bulk-asset/${assetId}`);
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
            <TableHead className="text-white">Keeper/Responsibility</TableHead>
            <TableHead className="text-white">Stock Status</TableHead>
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
              <TableCell>
                {" "}
                <UserNameDisplay
                  payrollNumber={asset.keeper} // Since keeper contains the payroll number
                  maxLength={20}
                  fallback="Unassigned"
                  className="text-sm"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {asset.isBulk && isLowQuantity(asset) && (
                    <Badge className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Low Stock
                    </Badge>
                  )}
                  {asset.isBulk && isGoodQuantity(asset) && (
                    <Badge className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Good Stock
                    </Badge>
                  )}
                  {!asset.isBulk && (
                    <Badge className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      Single Item
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    isLowQuantity(asset)
                      ? "text-red-600 font-semibold"
                      : "text-gray-900"
                  }
                >
                  {asset.isBulk ? asset.quantity : "N/A"}
                </span>
                {isLowQuantity(asset) && (
                  <span className="text-red-600 text-xs font-medium ml-1">
                    (Low)
                  </span>
                )}
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
