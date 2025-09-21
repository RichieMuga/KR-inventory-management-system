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
import { toggleViewModal } from "@/lib/features/modals/bulk-asset-tracking-modal";
import { BulkAsset } from "@/lib/data/bulkAssets";
import type { RootState } from "@/lib/store";

interface ViewBulkAssetModalProps {
  selectedAsset: BulkAsset | null;
}

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

export default function ViewBulkAssetModal({ selectedAsset }: ViewBulkAssetModalProps) {
  const dispatch = useDispatch();
  const { isViewModalOpen } = useSelector(
    (state: RootState) => state.bulkAssetTrackingModal
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
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}