"use client";

import { useState } from "react";
import { Eye, Edit, Trash2, Package, MoreVertical, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/pagination/pagination";

// Add these type definitions at the top of the file, after the imports
interface BulkAsset {
  id: number;
  name: string;
  issuedBy: string;
  department: string;
  issuedTo: string;
  signatory: string;
  timestamp: string;
  quantity: number;
  notes: string;
  status: "Issued" | "Not Issued";
}

// Sample bulk assets data - Fix the type issue by explicitly typing the status values
const initialBulkAssetsData: BulkAsset[] = [
  {
    id: 1,
    name: "HP Toner Cartridge (Black)",
    issuedBy: "Alice Brown",
    department: "IT Department",
    issuedTo: "John Doe",
    signatory: "John Doe",
    timestamp: "2024-07-30 10:30 AM",
    quantity: 1,
    notes: "For printer in Office 101",
    status: "Issued" as const,
  },
  {
    id: 2,
    name: "Network Cable (CAT6, 10m)",
    issuedBy: "Mike Johnson",
    department: "Network Operations",
    issuedTo: "Alice Brown",
    signatory: "Alice Brown",
    timestamp: "2024-07-29 02:15 PM",
    quantity: 2,
    notes: "New workstation setup",
    status: "Not Issued" as const,
  },
  {
    id: 3,
    name: "24-Inch Dell Monitor",
    issuedBy: "Emily Davis",
    department: "IT Support",
    issuedTo: "David Green",
    signatory: "David Green",
    timestamp: "2024-07-28 11:00 AM",
    quantity: 1,
    notes: "Monitor for workstation",
    status: "Issued" as const,
  },
  {
    id: 4,
    name: "USB Flash Drive (64GB)",
    issuedBy: "Sarah White",
    department: "IT Department",
    issuedTo: "Lisa Chen",
    signatory: "Lisa Chen",
    timestamp: "2024-07-27 09:45 AM",
    quantity: 1,
    notes: "Issued to new employee",
    status: "Issued" as const,
  },
  {
    id: 5,
    name: "Wireless Mouse (Logitech)",
    issuedBy: "Tom Wilson",
    department: "IT Support",
    issuedTo: "Sarah White",
    signatory: "Sarah White",
    timestamp: "2024-07-26 03:00 PM",
    quantity: 1,
    notes: "Replacement for faulty mouse",
    status: "Not Issued" as const,
  },
  {
    id: 6,
    name: "Ethernet Switch (24-port)",
    issuedBy: "Mike Johnson",
    department: "Network Operations",
    issuedTo: "IT Department",
    signatory: "Tom Wilson",
    timestamp: "2024-07-25 01:20 PM",
    quantity: 1,
    notes: "Network expansion",
    status: "Issued" as const,
  },
  {
    id: 7,
    name: "Power Cable (IEC C13)",
    issuedBy: "Alice Brown",
    department: "IT Department",
    issuedTo: "Server Team",
    signatory: "Mike Johnson",
    timestamp: "2024-07-24 09:15 AM",
    quantity: 5,
    notes: "Server maintenance",
    status: "Issued" as const,
  },
  {
    id: 8,
    name: "A4 Paper (Ream)",
    issuedBy: "Sarah White",
    department: "Administration",
    issuedTo: "Finance Department",
    signatory: "Lisa Chen",
    timestamp: "2024-07-23 02:30 PM",
    quantity: 10,
    notes: "Monthly office supplies",
    status: "Not Issued" as const,
  },
  {
    id: 9,
    name: "Printer Ink Cartridge (Color)",
    issuedBy: "Tom Wilson",
    department: "IT Support",
    issuedTo: "Marketing Team",
    signatory: "David Green",
    timestamp: "2024-07-22 11:15 AM",
    quantity: 3,
    notes: "For marketing materials printing",
    status: "Issued" as const,
  },
];

export default function BulkAssetsTracking() {
  // Update the state declarations to use the proper types
  const [bulkAssetsData, setBulkAssetsData] = useState<BulkAsset[]>(
    initialBulkAssetsData,
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<BulkAsset | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BulkAsset>>({});

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

  // Update function parameters to use proper types
  const handleView = (asset: BulkAsset) => {
    setSelectedAsset(asset);
    setViewDialogOpen(true);
  };

  const handleEdit = (asset: BulkAsset) => {
    setSelectedAsset(asset);
    setEditFormData({ ...asset });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    // Fix the type issue by ensuring we have a complete BulkAsset object
    if (editFormData.id) {
      setBulkAssetsData((prev) =>
        prev.map((asset) =>
          asset.id === editFormData.id
            ? ({ ...asset, ...editFormData } as BulkAsset)
            : asset,
        ),
      );
    }
    setEditDialogOpen(false);
    setEditFormData({});
  };

  const handleMarkIssued = (assetId: number) => {
    setBulkAssetsData((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              status: asset.status === "Issued" ? "Not Issued" : "Issued",
            }
          : asset,
      ),
    );
  };

  const handleDelete = (asset: BulkAsset) => {
    setSelectedAsset(asset);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAsset) {
      setBulkAssetsData((prev) =>
        prev.filter((asset) => asset.id !== selectedAsset.id),
      );
    }
    setDeleteDialogOpen(false);
    setSelectedAsset(null);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-5 py-3 sm:flex-row">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">
          Bulk Asset Tracking
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
            onClick={()=>console.log("search")}
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
            {bulkAssetsData.map((asset) => (
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
                        onClick={() => handleMarkIssued(asset.id)}
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {bulkAssetsData.map((asset) => (
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
                  <DropdownMenuItem onClick={() => handleMarkIssued(asset.id)}>
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
            <DialogDescription>
              View complete information for this bulk asset
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
                  Status
                </Label>
                <div className="mt-1">
                  {getStatusBadge(selectedAsset.status)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Issued By
                </Label>
                <p className="text-sm">{selectedAsset.issuedBy}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Department
                </Label>
                <p className="text-sm">{selectedAsset.department}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Issued To
                </Label>
                <p className="text-sm">{selectedAsset.issuedTo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Signatory
                </Label>
                <p className="text-sm">{selectedAsset.signatory}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Timestamp
                </Label>
                <p className="text-sm">{selectedAsset.timestamp}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Quantity
                </Label>
                <p className="text-sm font-semibold">
                  {selectedAsset.quantity}
                </p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-600">
                  Notes
                </Label>
                <p className="text-sm mt-1">{selectedAsset.notes}</p>
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
            <DialogTitle>Edit Asset Record</DialogTitle>
            <DialogDescription>
              Update the information for this bulk asset
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
              <Label htmlFor="issuedBy">Issued By</Label>
              <Input
                id="issuedBy"
                value={editFormData.issuedBy || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    issuedBy: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={editFormData.department || ""}
                onValueChange={(value) =>
                  setEditFormData((prev) => ({ ...prev, department: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT Department">IT Department</SelectItem>
                  <SelectItem value="Network Operations">
                    Network Operations
                  </SelectItem>
                  <SelectItem value="IT Support">IT Support</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="issuedTo">Issued To</Label>
              <Input
                id="issuedTo"
                value={editFormData.issuedTo || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    issuedTo: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="signatory">Signatory</Label>
              <Input
                id="signatory"
                value={editFormData.signatory || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    signatory: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={editFormData.quantity || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    quantity: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editFormData.notes || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this asset record? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="py-4">
              <p className="text-sm">
                <strong>Asset:</strong> {selectedAsset.name}
              </p>
              <p className="text-sm">
                <strong>Issued To:</strong> {selectedAsset.issuedTo}
              </p>
              <p className="text-sm">
                <strong>Department:</strong> {selectedAsset.department}
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
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Pagination />
    </div>
  );
}
