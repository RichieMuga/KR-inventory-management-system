import { useState, useEffect } from "react";
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
import {
  Assignment,
  AssignmentFormData,
  AvailableAsset,
  BulkAsset,
  UniqueAsset,
} from "@/types/assignment";

interface NewAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetType: "bulk" | "unique";
  availableAssets: AvailableAsset[];
  onSave: (assignment: Assignment) => void;
  nextId: string;
}

export default function NewAssignmentDialog({
  open,
  onOpenChange,
  assetType,
  availableAssets,
  onSave,
  nextId,
}: NewAssignmentDialogProps) {
  const [formData, setFormData] = useState<AssignmentFormData>({
    assetType,
    dateIssued: new Date().toISOString().split("T")[0],
    status: "In use",
    conditionIssued: "Good",
    quantityIssued: 1,
    quantityRemaining: 0,
  });

  // Reset form when dialog opens/closes or asset type changes
  useEffect(() => {
    if (open) {
      setFormData({
        assetType,
        dateIssued: new Date().toISOString().split("T")[0],
        status: "In use",
        conditionIssued: "Good",
        quantityIssued: assetType === "unique" ? 1 : undefined,
        quantityRemaining: assetType === "unique" ? 0 : undefined,
      });
    }
  }, [open, assetType]);

  const isUniqueAsset = (asset: AvailableAsset): asset is UniqueAsset => {
    return "serialNumber" in asset;
  };

  const isBulkAsset = (asset: AvailableAsset): asset is BulkAsset => {
    return "quantity" in asset;
  };

  const handleAssetSelect = (assetName: string) => {
    const asset = availableAssets.find((a) => a.name === assetName);
    if (!asset) return;

    setFormData((prev) => ({
      ...prev,
      assetName,
      assetId: asset.id,
      // Auto-set quantity for unique assets
      ...(isUniqueAsset(asset) && {
        quantityIssued: 1,
        quantityRemaining: 0,
      }),
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.assetName || !formData.assignedTo || !formData.assignedBy) {
      return;
    }

    if (
      assetType === "bulk" &&
      (!formData.quantityIssued || formData.quantityRemaining === undefined)
    ) {
      return;
    }

    const newAssignment: Assignment = {
      id: nextId,
      assetName: formData.assetName!,
      assetType: formData.assetType!,
      assetId: formData.assetId!,
      assignedTo: formData.assignedTo!,
      assignedBy: formData.assignedBy!,
      dateIssued: formData.dateIssued!,
      conditionIssued: formData.conditionIssued!,
      quantityIssued: formData.quantityIssued!,
      quantityRemaining: formData.quantityRemaining!,
      status: formData.status as Assignment["status"],
      notes: formData.notes,
      dateReturned: formData.dateReturned,
      conditionReturned: formData.conditionReturned,
    };

    onSave(newAssignment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Assignment</DialogTitle>
          <DialogDescription>
            Assign a {assetType} asset to a user
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Asset Selection */}
          <div className="col-span-2">
            <Label>Select Asset *</Label>
            <Select
              value={formData.assetName || ""}
              onValueChange={handleAssetSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {availableAssets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.name}>
                    {asset.name}
                    {isUniqueAsset(asset) && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({asset.serialNumber})
                      </span>
                    )}
                    {isBulkAsset(asset) && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Qty: {asset.quantity})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Details */}
          <div>
            <Label>Assigned To *</Label>
            <Input
              value={formData.assignedTo || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  assignedTo: e.target.value,
                }))
              }
              placeholder="Enter assignee name"
            />
          </div>

          <div>
            <Label>Assigned By *</Label>
            <Input
              value={formData.assignedBy || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  assignedBy: e.target.value,
                }))
              }
              placeholder="Enter assigner name"
            />
          </div>

          <div>
            <Label>Date Issued *</Label>
            <Input
              type="date"
              value={formData.dateIssued || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dateIssued: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label>Condition Issued *</Label>
            <Select
              value={formData.conditionIssued || "Good"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  conditionIssued: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity Fields (mainly for bulk assets) */}
          {assetType === "bulk" && (
            <>
              <div>
                <Label>Quantity Issued *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantityIssued || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantityIssued: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <Label>Quantity Remaining *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantityRemaining || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantityRemaining: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </>
          )}

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status || "In use"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as Assignment["status"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In use">In use</SelectItem>
                <SelectItem value="Not in use">Not in use</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Return fields (if status is Returned) */}
          {formData.status === "Returned" && (
            <>
              <div>
                <Label>Date Returned</Label>
                <Input
                  type="date"
                  value={formData.dateReturned || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dateReturned: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Condition Returned</Label>
                <Select
                  value={formData.conditionReturned || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      conditionReturned: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-kr-maroon hover:bg-kr-maroon-dark"
            disabled={
              !formData.assetName ||
              !formData.assignedTo ||
              !formData.assignedBy ||
              (assetType === "bulk" &&
                (!formData.quantityIssued ||
                  formData.quantityRemaining === undefined))
            }
          >
            Create Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}