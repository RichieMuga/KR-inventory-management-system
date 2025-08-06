"use client";

import { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Tag,
  UserCheck,
  MoreVertical,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Add these type definitions at the top of the file, after the imports
interface UniqueAsset {
  id: string;
  name: string;
  serialNumber: string;
  defaultLocation: string;
  movedTo: string;
  issuedTo: string;
  status: "In Use" | "Not In Use";
  keeper: string;
}

// Sample unique assets data - Fix the type issue by explicitly typing the status values
const initialUniqueAssetsData: UniqueAsset[] = [
  {
    id: "KR-LAP-001",
    name: "Dell Latitude 7420",
    serialNumber: "DL7420-2024-001",
    defaultLocation: "IT Store Room A",
    movedTo: "Office 101",
    issuedTo: "John Doe",
    status: "In Use" as const,
    keeper: "John Doe",
  },
  {
    id: "KR-PRT-002",
    name: "HP LaserJet Pro M404n",
    serialNumber: "HP404-2024-002",
    defaultLocation: "IT Store Room A",
    movedTo: "IT Store Room A",
    issuedTo: "-",
    status: "Not In Use" as const,
    keeper: "Alice Brown",
  },
  {
    id: "KR-MON-003",
    name: "Samsung 27-inch Monitor",
    serialNumber: "SAM27-2024-003",
    defaultLocation: "IT Store Room B",
    movedTo: "Office 205",
    issuedTo: "David Green",
    status: "In Use" as const,
    keeper: "David Green",
  },
  {
    id: "KR-TAB-004",
    name: "iPad Pro 11-inch",
    serialNumber: "IPD11-2024-004",
    defaultLocation: "IT Store Room A",
    movedTo: "User Desk 205",
    issuedTo: "Sarah White",
    status: "In Use" as const,
    keeper: "Sarah White",
  },
  {
    id: "KR-CAM-005",
    name: "Canon EOS R6 Camera",
    serialNumber: "CAN-R6-2024-005",
    defaultLocation: "Media Room",
    movedTo: "Marketing Department",
    issuedTo: "Lisa Chen",
    status: "In Use" as const,
    keeper: "Lisa Chen",
  },
  {
    id: "KR-SRV-006",
    name: "Dell PowerEdge R740",
    serialNumber: "DELL-R740-2024-006",
    defaultLocation: "Server Room 1",
    movedTo: "Server Room 1",
    issuedTo: "-",
    status: "In Use" as const,
    keeper: "Tom Wilson",
  },
  {
    id: "KR-LAP-007",
    name: "MacBook Pro 16-inch",
    serialNumber: "MBP16-2024-007",
    defaultLocation: "IT Store Room B",
    movedTo: "IT Store Room B",
    issuedTo: "-",
    status: "Not In Use" as const,
    keeper: "Mike Johnson",
  },
  {
    id: "KR-PRJ-008",
    name: "Epson PowerLite Projector",
    serialNumber: "EPL-2024-008",
    defaultLocation: "Conference Room A",
    movedTo: "Conference Room B",
    issuedTo: "Meeting Room",
    status: "In Use" as const,
    keeper: "Emily Davis",
  },
];

export default function UniqueAssetsTracking() {
  // Update the state declarations to use the proper types
  const [uniqueAssetsData, setUniqueAssetsData] = useState<UniqueAsset[]>(
    initialUniqueAssetsData,
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<UniqueAsset | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UniqueAsset>>({});

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

  // Update function parameters to use proper types
  const handleView = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    setViewDialogOpen(true);
  };

  const handleEdit = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    setEditFormData({ ...asset });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    // Fix the type issue by ensuring we have a complete UniqueAsset object
    if (editFormData.id) {
      setUniqueAssetsData((prev) =>
        prev.map((asset) =>
          asset.id === editFormData.id
            ? ({ ...asset, ...editFormData } as UniqueAsset)
            : asset,
        ),
      );
    }
    setEditDialogOpen(false);
    setEditFormData({});
  };

  const handleMove = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    setEditFormData({ ...asset });
    setMoveDialogOpen(true);
  };

  const handleSaveMove = () => {
    // Fix the type issue by ensuring we have a complete UniqueAsset object
    if (editFormData.id) {
      setUniqueAssetsData((prev) =>
        prev.map((asset) =>
          asset.id === editFormData.id
            ? ({ ...asset, ...editFormData } as UniqueAsset)
            : asset,
        ),
      );
    }
    setMoveDialogOpen(false);
    setEditFormData({});
  };

  const handleAssign = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    setEditFormData({ ...asset });
    setAssignDialogOpen(true);
  };

  const handleSaveAssign = () => {
    // Fix the type issue by ensuring we have a complete UniqueAsset object
    if (editFormData.id) {
      setUniqueAssetsData((prev) =>
        prev.map((asset) =>
          asset.id === editFormData.id
            ? ({ ...asset, ...editFormData } as UniqueAsset)
            : asset,
        ),
      );
    }
    setAssignDialogOpen(false);
    setEditFormData({});
  };

  const handleDelete = (asset: UniqueAsset) => {
    setSelectedAsset(asset);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAsset) {
      setUniqueAssetsData((prev) =>
        prev.filter((asset) => asset.id !== selectedAsset.id),
      );
    }
    setDeleteDialogOpen(false);
    setSelectedAsset(null);
  };

  return (
    <div className="p-6">
      <div className="py-3 flex flex-col gap-5 sm:flex-row">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">
          Unique Asset Tracking
        </h1>
        <div className="relative flex w-full max-w-sm md:max-w-xs">
          <Input
            type="search"
            placeholder="Search assets by name or serial..."
          />
          <Button
            type="button"
            size="icon"
            className="rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
            onClick={() => console.log("search")}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Desktop Table View */}
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
            {uniqueAssetsData.map((asset) => (
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {uniqueAssetsData.map((asset) => (
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
            <DialogDescription>
              View complete information for this unique asset
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Asset Name
                </Label>
                <p className="text-sm font-semibold">{selectedAsset.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Serial Number
                </Label>
                <p className="text-sm font-mono">
                  {selectedAsset.serialNumber}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Default Location
                </Label>
                <p className="text-sm">{selectedAsset.defaultLocation}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Current Location
                </Label>
                <p className="text-sm">{selectedAsset.movedTo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Issued To
                </Label>
                <p className="text-sm">{selectedAsset.issuedTo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Status
                </Label>
                <div className="mt-1">
                  {getStatusBadge(selectedAsset.status)}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-600">
                  Keeper/Responsibility
                </Label>
                <p className="text-sm mt-1">{selectedAsset.keeper}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update the information for this unique asset
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                value={editFormData.name || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={editFormData.serialNumber || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    serialNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="defaultLocation">Default Location</Label>
              <Input
                id="defaultLocation"
                value={editFormData.defaultLocation || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    defaultLocation: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="keeper">Keeper/Responsibility</Label>
              <Input
                id="keeper"
                value={editFormData.keeper || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    keeper: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Asset Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Asset</DialogTitle>
            <DialogDescription>
              Update the current location of this asset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="movedTo">New Location</Label>
              <Input
                id="movedTo"
                value={editFormData.movedTo || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    movedTo: e.target.value,
                  }))
                }
                placeholder="Enter new location"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveMove}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Move Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign/Return Asset Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAsset?.status === "In Use"
                ? "Return Asset"
                : "Assign Asset"}
            </DialogTitle>
            <DialogDescription>
              {selectedAsset?.status === "In Use"
                ? "Return this asset and update its status"
                : "Assign this asset to a user"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="issuedTo">
                {selectedAsset?.status === "In Use"
                  ? "Return From"
                  : "Assign To"}
              </Label>
              <Input
                id="issuedTo"
                value={editFormData.issuedTo || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    issuedTo: e.target.value,
                    status: (e.target.value === "-"
                      ? "Not In Use"
                      : "In Use") as "In Use" | "Not In Use",
                  }))
                }
                placeholder={
                  selectedAsset?.status === "In Use"
                    ? "Enter '-' to return"
                    : "Enter user name"
                }
              />
            </div>
            <div>
              <Label htmlFor="keeper">Keeper/Responsibility</Label>
              <Input
                id="keeper"
                value={editFormData.keeper || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    keeper: e.target.value,
                  }))
                }
                placeholder="Enter keeper name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAssign}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {selectedAsset?.status === "In Use"
                ? "Return Asset"
                : "Assign Asset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this asset? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="py-4">
              <p className="text-sm">
                <strong>Asset:</strong> {selectedAsset.name}
              </p>
              <p className="text-sm">
                <strong>Serial Number:</strong> {selectedAsset.serialNumber}
              </p>
              <p className="text-sm">
                <strong>Current Location:</strong> {selectedAsset.movedTo}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
