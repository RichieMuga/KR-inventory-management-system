// components/tracking/modals/DeleteAssetModal.tsx

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
import { toggleDeleteModal } from "@/lib/features/modals/unique-asset-tracking-modal";
import { UniqueAsset } from "@/lib/data/uniqueAssets";
import type { RootState } from "@/lib/store";

interface DeleteAssetModalProps {
  selectedAsset: UniqueAsset | null;
  onDelete: (assetId: string) => void;
}

export default function DeleteAssetModal({ selectedAsset, onDelete }: DeleteAssetModalProps) {
  const dispatch = useDispatch();
  const { isDeleteModalOpen } = useSelector(
    (state: RootState) => state.uniqueAssetTrackingModal
  );

  const handleClose = () => {
    dispatch(toggleDeleteModal());
  };

  const handleDelete = () => {
    if (selectedAsset) {
      onDelete(selectedAsset.id);
      dispatch(toggleDeleteModal());
    }
  };

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={handleClose}>
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}