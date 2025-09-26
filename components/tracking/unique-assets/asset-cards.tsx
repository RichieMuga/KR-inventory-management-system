"use client";

import { useDispatch } from "react-redux";
import {
  Eye,
  Tag,
  UserCheck,
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
import { UniqueAsset } from "@/lib/data/uniqueAssets";
import {
  toggleViewModal,
  toggleMoveModal,
  toggleAssignModal,
} from "@/lib/features/modals/unique-asset-tracking-modal";

interface AssetsCardsProps {
  assets: UniqueAsset[];
  setSelectedAsset: (asset: UniqueAsset) => void;
  setEditFormData: (data: Partial<UniqueAsset>) => void;
}

const getStatusBadge = (status: string) => {
  if (status === "In Use") {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        In Use
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="text-gray-600 border-gray-300">
        Not In Use
      </Badge>
    );
  }
};

export default function AssetsCards({ assets, setSelectedAsset, setEditFormData }: AssetsCardsProps) {
  const dispatch = useDispatch();

  const handleView = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    dispatch(toggleViewModal());
  };

  const handleMove = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    setEditFormData({ ...asset });
    dispatch(toggleMoveModal());
  };

  const handleAssign = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    setEditFormData({ ...asset });
    dispatch(toggleAssignModal());
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
              <p className="text-sm text-gray-600 font-mono mb-2">
                {asset.serialNumber}
              </p>
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(asset.status)}
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
                <DropdownMenuItem onClick={() => handleMove(asset)}>
                  <Tag className="h-4 w-4 mr-2" />
                  Move Asset
                </DropdownMenuItem>
                {asset.status === "Not In Use" && (
                  <DropdownMenuItem onClick={() => handleAssign(asset)}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Assign Asset
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Default Location:</span>
              <span className="font-medium">{asset.defaultLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Location:</span>
              <span className="font-medium">{asset.movedTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Issued To:</span>
              <span className="font-medium">{asset.issuedTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Keeper:</span>
              <span className="font-medium">{asset.keeper}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}