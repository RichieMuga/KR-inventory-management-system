// components/tracking/modals/DeleteBulkAssetModal.tsx

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
import { toggleDeleteModal } from "@/lib/features/modals/bulk-asset-tracking-modal";
import { BulkAsset } from "@/lib/data/bulkAssets";
import type { RootState } from "@/lib/store";

interface DeleteBulkAssetModalProps {
  selectedAsset: BulkAsset | null;
  onDelete: (assetId: number) => void;
}

export default function DeleteBulkAssetModal({ selectedAsset, onDelete }: DeleteBulkAssetModalProps) {
  const dispatch = useDispatch();
  const { isDeleteModalOpen } = useSelector(
    (state: RootState) => state.bulkAssetTrackingModal
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}