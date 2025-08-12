import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Assignment } from "@/types/assignment";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
  onConfirm: () => void;
}

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  assignment,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Assignment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this assignment? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-medium text-red-900">Assignment Details:</p>
            <div className="mt-2 space-y-1 text-sm text-red-800">
              <p>
                <strong>Asset:</strong> {assignment.assetName}
              </p>
              <p>
                <strong>Assigned To:</strong> {assignment.assignedTo}
              </p>
              <p>
                <strong>Date Issued:</strong> {assignment.dateIssued}
              </p>
              <p>
                <strong>Status:</strong> {assignment.status}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
