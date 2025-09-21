"use client";

import { useDispatch } from "react-redux";
import {
  Eye,
  Edit,
  Trash2,
  Tag,
  UserCheck,
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
import { UniqueAsset } from "@/lib/data/uniqueAssets";
import {
  toggleViewModal,
  toggleEditModal,
  toggleMoveModal,
  toggleAssignModal,
  toggleDeleteModal,
} from "@/lib/features/modals/unique-asset-tracking-modal";

interface AssetsTableProps {
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

export default function AssetsTable({ assets, setSelectedAsset, setEditFormData }: AssetsTableProps) {
  const dispatch = useDispatch();

  const handleView = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    dispatch(toggleViewModal());
  };

  const handleEdit = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    setEditFormData({ ...asset });
    dispatch(toggleEditModal());
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

  const handleDelete = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    dispatch(toggleDeleteModal());
  };

  return (
    <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-red-900 hover:bg-red-900">
            <TableHead className="text-white">Asset Name</TableHead>
            <TableHead className="text-white">Serial Number</TableHead>
            <TableHead className="text-white">Default Location</TableHead>
            <TableHead className="text-white">Moved To</TableHead>
            <TableHead className="text-white">Issued To</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">
              Keeper/Responsibility
            </TableHead>
            <TableHead className="text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.name}</TableCell>
              <TableCell className="font-mono text-sm">
                {asset.serialNumber}
              </TableCell>
              <TableCell>{asset.defaultLocation}</TableCell>
              <TableCell>{asset.movedTo}</TableCell>
              <TableCell>{asset.issuedTo}</TableCell>
              <TableCell>{getStatusBadge(asset.status)}</TableCell>
              <TableCell>{asset.keeper}</TableCell>
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
                      Edit Asset
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMove(asset)}>
                      <Tag className="h-4 w-4 mr-2" />
                      Move Asset
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAssign(asset)}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      {asset.status === "In Use"
                        ? "Return Asset"
                        : "Assign Asset"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(asset)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Asset
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