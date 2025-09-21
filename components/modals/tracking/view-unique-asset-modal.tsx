// components/tracking/modals/ViewAssetModal.tsx

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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toggleViewModal } from "@/lib/features/modals/unique-asset-tracking-modal";
import { UniqueAsset } from "@/lib/data/uniqueAssets";
import { RootState } from "@/lib/store";

interface ViewAssetModalProps {
  selectedAsset: UniqueAsset | null;
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

export default function ViewAssetModal({ selectedAsset }: ViewAssetModalProps) {
  const dispatch = useDispatch();
  const { isViewModalOpen } = useSelector(
    (state: RootState) => state.uniqueAssetTrackingModal
  );

  const handleClose = () => {
    dispatch(toggleViewModal());
  };

  return (
    <Dialog open={isViewModalOpen} onOpenChange={handleClose}>
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
              <p className="text-sm font-mono">{selectedAsset.serialNumber}</p>
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
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <div className="mt-1">{getStatusBadge(selectedAsset.status)}</div>
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
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}