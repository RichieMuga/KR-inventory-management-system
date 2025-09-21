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
import { toggleEditModal } from "@/lib/features/modals/unique-asset-tracking-modal";
import { UniqueAsset } from "@/lib/data/uniqueAssets";
import type { RootState } from "@/lib/store";

interface EditAssetModalProps {
  selectedAsset: UniqueAsset | null;
  editFormData: Partial<UniqueAsset>;
  setEditFormData: (data: Partial<UniqueAsset>) => void;
  onSave: (asset: Partial<UniqueAsset> & { id: string }) => void;
}

export default function EditAssetModal({ 
  selectedAsset, 
  editFormData, 
  setEditFormData, 
  onSave 
}: EditAssetModalProps) {
  const dispatch = useDispatch();
  const { isEditModalOpen } = useSelector(
    (state: RootState) => state.uniqueAssetTrackingModal
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

  const handleInputChange = (field: string, value: string) => {
    setEditFormData({ ...editFormData, [field]: value });
  };

  return (
    <Dialog open={isEditModalOpen} onOpenChange={handleClose}>
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
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              value={editFormData.serialNumber || ""}
              onChange={(e) =>
                handleInputChange("serialNumber", e.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="defaultLocation">Default Location</Label>
            <Input
              id="defaultLocation"
              value={editFormData.defaultLocation || ""}
              onChange={(e) =>
                handleInputChange("defaultLocation", e.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="keeper">Keeper/Responsibility</Label>
            <Input
              id="keeper"
              value={editFormData.keeper || ""}
              onChange={(e) => handleInputChange("keeper", e.target.value)}
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