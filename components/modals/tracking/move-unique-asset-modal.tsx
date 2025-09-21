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
import { toggleMoveModal } from "@/lib/features/modals/unique-asset-tracking-modal";
import { UniqueAsset } from "@/lib/data/uniqueAssets";
import type { RootState } from "@/lib/store";

interface MoveAssetModalProps {
  selectedAsset: UniqueAsset | null;
  editFormData: Partial<UniqueAsset>;
  setEditFormData: (data: Partial<UniqueAsset>) => void;
  onSave: (asset: Partial<UniqueAsset> & { id: string }) => void;
}

export default function MoveAssetModal({ 
  selectedAsset, 
  editFormData, 
  setEditFormData, 
  onSave 
}: MoveAssetModalProps) {
  const dispatch = useDispatch();
  const { isMoveModalOpen } = useSelector(
    (state: RootState) => state.uniqueAssetTrackingModal
  );

  const handleClose = () => {
    dispatch(toggleMoveModal());
  };

  const handleSave = () => {
    if (editFormData.id) {
      onSave(editFormData as any);
      dispatch(toggleMoveModal());
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditFormData({ ...editFormData, [field]: value });
  };

  return (
    <Dialog open={isMoveModalOpen} onOpenChange={handleClose}>
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
              onChange={(e) => handleInputChange("movedTo", e.target.value)}
              placeholder="Enter new location"
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
            Move Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}