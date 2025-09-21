// components/tracking/modals/EditBulkAssetModal.tsx

"use client";

import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
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
import { toggleEditModal } from "@/lib/features/modals/bulk-asset-tracking-modal";
import { BulkAsset } from "@/lib/data/bulkAssets";
import type { RootState } from "@/lib/store";

interface EditBulkAssetModalProps {
  selectedAsset: BulkAsset | null;
  editFormData: Partial<BulkAsset>;
  setEditFormData: (data: Partial<BulkAsset>) => void;
  onSave: (asset: Partial<BulkAsset> & { id: number }) => void;
}

export default function EditBulkAssetModal({ 
  selectedAsset, 
  editFormData, 
  setEditFormData, 
  onSave 
}: EditBulkAssetModalProps) {
  const dispatch = useDispatch();
  const { isEditModalOpen } = useSelector(
    (state: RootState) => state.bulkAssetTrackingModal
  );

  const handleClose = () => {
    dispatch(toggleEditModal());
  };

  const handleSave = () => {
    if (editFormData.id) {
      onSave(editFormData as any);
      dispatch(toggleEditModal());
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditFormData({ ...editFormData, [field]: value });
  };

  return (
    <Dialog open={isEditModalOpen} onOpenChange={handleClose}>
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
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="issuedBy">Issued By</Label>
            <Input
              id="issuedBy"
              value={editFormData.issuedBy || ""}
              onChange={(e) => handleInputChange("issuedBy", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Select
              value={editFormData.department || ""}
              onValueChange={(value) => handleInputChange("department", value)}
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
              onChange={(e) => handleInputChange("issuedTo", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="signatory">Signatory</Label>
            <Input
              id="signatory"
              value={editFormData.signatory || ""}
              onChange={(e) => handleInputChange("signatory", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={editFormData.quantity || ""}
              onChange={(e) =>
                handleInputChange("quantity", parseInt(e.target.value))
              }
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={editFormData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}