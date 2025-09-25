"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";

interface Assignment {
  id: string;
  assetName: string;
  assetType: "bulk" | "unique";
  assignedTo: string;
  status: string;
}

interface DeleteAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
  onConfirm: (assignment: Assignment, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export default function DeleteAssignmentDialog({
  open,
  onOpenChange,
  assignment,
  onConfirm,
  isLoading = false,
}: DeleteAssignmentDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      onOpenChange(false);
    }
  };

  const handleConfirm = async () => {
    if (!assignment) return;

    try {
      setIsSubmitting(true);
      await onConfirm(assignment, reason);
      setReason("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting assignment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignment) return null;

  const isBulkAssignment = assignment.assetType === "bulk";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Assignment
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The assignment will be permanently
            removed from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Assignment Details */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Asset:</span>
              <span className="text-gray-900">{assignment.assetName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Assigned To:</span>
              <span className="text-gray-900">{assignment.assignedTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Type:</span>
              <span className="text-gray-900 capitalize">
                {assignment.assetType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Status:</span>
              <span className="text-gray-900">{assignment.status}</span>
            </div>
          </div>

          {/* Reason Input for Bulk Assignments */}
          {isBulkAssignment && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Deletion Reason {isBulkAssignment && "(Required for bulk assignments)"}
              </Label>
              <Textarea
                id="reason"
                placeholder="e.g., End of project - returning all equipment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px]"
                disabled={isSubmitting}
              />
              {isBulkAssignment && reason.trim().length === 0 && (
                <p className="text-sm text-amber-600">
                  A reason is required for deleting bulk assignments for audit purposes.
                </p>
              )}
            </div>
          )}

          {/* Unique Assignment Note */}
          {!isBulkAssignment && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Deleting this unique assignment will make the asset available for
                new assignments.
              </p>
            </div>
          )}

          {/* Bulk Assignment Note */}
          {isBulkAssignment && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Deleting this bulk assignment will restore the assigned quantity
                back to the asset's available stock.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={
                isSubmitting ||
                (isBulkAssignment && reason.trim().length === 0)
              }
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Assignment"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}