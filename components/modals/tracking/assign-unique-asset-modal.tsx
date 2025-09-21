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
import { toggleAssignModal } from "@/lib/features/modals/unique-asset-tracking-modal";
import { UniqueAsset } from "@/lib/data/uniqueAssets";
import type { RootState } from "@/lib/store";

interface AssignAssetModalProps {
  selectedAsset: UniqueAsset | null;
  editFormData: Partial<UniqueAsset>;
  setEditFormData: (data: Partial<UniqueAsset>) => void;
  onSave: (asset: Partial<UniqueAsset> & { id: string }) => void;
}

export default function AssignAssetModal({ 
  selectedAsset, 
  editFormData, 
  setEditFormData, 
  onSave 
}: AssignAssetModalProps) {
  const dispatch = useDispatch();
  const { isAssignModalOpen } = useSelector(
    (state: RootState) => state.uniqueAssetTrackingModal
  );

  const handleClose = () => {
    dispatch(toggleAssignModal());
  };

  const handleSave = () => {
    if (editFormData.id) {
      onSave(editFormData as any);
      dispatch(toggleAssignModal());
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const updates: any = { ...editFormData, [field]: value };
    
    // Auto-update status based on issuedTo field
    if (field === "issuedTo") {
      updates.status = value === "-" ? "Not In Use" : "In Use";
    }
    
    setEditFormData(updates);
  };

  return (
    <Dialog open={isAssignModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedAsset?.status === "In Use" ? "Return Asset" : "Assign Asset"}
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
              {selectedAsset?.status === "In Use" ? "Return From" : "Assign To"}
            </Label>
            <Input
              id="issuedTo"
              value={editFormData.issuedTo || ""}
              onChange={(e) => handleInputChange("issuedTo", e.target.value)}
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
              onChange={(e) => handleInputChange("keeper", e.target.value)}
              placeholder="Enter keeper name"
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
            {selectedAsset?.status === "In Use" ? "Return Asset" : "Assign Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}