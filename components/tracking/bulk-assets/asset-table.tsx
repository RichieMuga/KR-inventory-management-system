// components/tracking/BulkAssetsTable.tsx

"use client";

import { useDispatch } from "react-redux";
import {
  Eye,
  Edit,
  Trash2,
  Package,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BulkAsset } from "@/lib/data/bulkAssets";
import {
  toggleViewModal,
  toggleEditModal,
  toggleDeleteModal,
} from "@/lib/features/modals/bulk-asset-tracking-modal";

interface BulkAssetsTableProps {
  assets: BulkAsset[];
  setSelectedAsset: (asset: BulkAsset) => void;
  setEditFormData: (data: Partial<BulkAsset>) => void;
  onToggleStatus: (assetId: number) => void;
}

const getStatusBadge = (status: string) => {
  if (status === "Issued") {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        Issued
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="text-gray-600 border-gray-300">
        Not Issued
      </Badge>
    );
  }
};

export default function BulkAssetsTable({ 
  assets, 
  setSelectedAsset, 
  setEditFormData,
  onToggleStatus
}: BulkAssetsTableProps) {
  const dispatch = useDispatch();

  const handleView = (asset: BulkAsset) => {
    setSelectedAsset(asset);
    dispatch(toggleViewModal());
  };

  const handleEdit = (asset: BulkAsset) => {
    setSelectedAsset(asset);
    setEditFormData({ ...asset });
    dispatch(toggleEditModal());
  };

  const handleDelete = (asset: BulkAsset) => {
    setSelectedAsset(asset);
    dispatch(toggleDeleteModal());
  };

  return (
    <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-red-900 hover:bg-red-900">
            <TableHead className="text-white">Asset Name</TableHead>
            <TableHead className="text-white">
              Issued By (Store Keeper)
            </TableHead>
            <TableHead className="text-white">Department</TableHead>
            <TableHead className="text-white">Issued To</TableHead>
            <TableHead className="text-white">Signatory</TableHead>
            <TableHead className="text-white">Timestamp</TableHead>
            <TableHead className="text-white">Quantity</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Notes</TableHead>
            <TableHead className="text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.name}</TableCell>
              <TableCell>{asset.issuedBy}</TableCell>
              <TableCell>{asset.department}</TableCell>
              <TableCell>{asset.issuedTo}</TableCell>
              <TableCell>{asset.signatory}</TableCell>
              <TableCell>{asset.timestamp}</TableCell>
              <TableCell className="text-center font-semibold">
                {asset.quantity}
              </TableCell>
              <TableCell>{getStatusBadge(asset.status)}</TableCell>
              <TableCell className="max-w-xs truncate" title={asset.notes}>
                {asset.notes}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleView(asset)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(asset)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Record
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onToggleStatus(asset.id)}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      {asset.status === "Issued"
                        ? "Mark Not Issued"
                        : "Mark as Issued"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(asset)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Record
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}