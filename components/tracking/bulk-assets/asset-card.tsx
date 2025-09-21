// components/tracking/BulkAssetsCards.tsx

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
import { Card } from "@/components/ui/card";
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

interface BulkAssetsCardsProps {
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

export default function BulkAssetsCards({ 
  assets, 
  setSelectedAsset, 
  setEditFormData,
  onToggleStatus
}: BulkAssetsCardsProps) {
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
    <div className="md:hidden space-y-4">
      {assets.map((asset) => (
        <Card key={asset.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {asset.name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(asset.status)}
                <span className="text-sm text-gray-500">
                  Qty: {asset.quantity}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleView(asset)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(asset)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Record
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(asset.id)}>
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
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Issued By:</span>
              <span className="font-medium">{asset.issuedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium">{asset.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Issued To:</span>
              <span className="font-medium">{asset.issuedTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Signatory:</span>
              <span className="font-medium">{asset.signatory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{asset.timestamp}</span>
            </div>
            {asset.notes && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-600">Notes:</span>
                <p className="text-gray-900 mt-1">{asset.notes}</p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}