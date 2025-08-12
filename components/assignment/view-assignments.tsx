import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Assignment } from "@/types/assignment";

interface ViewAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
}

export default function ViewAssignmentDialog({ 
  open, 
  onOpenChange, 
  assignment 
}: ViewAssignmentDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In use":
        return (
          <Badge className="text-gray-600 border-gray-300 bg-white">
            In use
          </Badge>
        );
      case "Returned":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Returned
          </Badge>
        );
      case "Not in use":
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            Not in use
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            {status}
          </Badge>
        );
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assignment Details</DialogTitle>
          <DialogDescription>
            View complete information for this asset assignment
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-kr-maroon">
              Asset Information
            </h3>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Asset Name</Label>
            <p className="mt-1 text-sm">{assignment.assetName}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Asset Type</Label>
            <p className="mt-1 text-sm capitalize">{assignment.assetType}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Asset ID</Label>
            <p className="mt-1 text-sm">{assignment.assetId}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <div className="mt-1">{getStatusBadge(assignment.status)}</div>
          </div>

          {/* Assignment Information */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-4 text-kr-maroon">
              Assignment Information
            </h3>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
            <p className="mt-1 text-sm">{assignment.assignedTo}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Assigned By</Label>
            <p className="mt-1 text-sm">{assignment.assignedBy}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Date Issued</Label>
            <p className="mt-1 text-sm">{assignment.dateIssued}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Condition Issued</Label>
            <p className="mt-1 text-sm">{assignment.conditionIssued}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Quantity Issued</Label>
            <p className="mt-1 text-sm">{assignment.quantityIssued}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Quantity Remaining</Label>
            <p className="mt-1 text-sm">{assignment.quantityRemaining}</p>
          </div>

          {/* Return Information (if applicable) */}
          {(assignment.dateReturned || assignment.conditionReturned) && (
            <>
              <div className="col-span-2 mt-4">
                <h3 className="text-lg font-semibold mb-4 text-kr-maroon">
                  Return Information
                </h3>
              </div>
              
              {assignment.dateReturned && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Date Returned</Label>
                  <p className="mt-1 text-sm">{assignment.dateReturned}</p>
                </div>
              )}
              
              {assignment.conditionReturned && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Condition Returned</Label>
                  <p className="mt-1 text-sm">{assignment.conditionReturned}</p>
                </div>
              )}
            </>
          )}

          {/* Notes */}
          {assignment.notes && (
            <div className="col-span-2 mt-4">
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">
                {assignment.notes}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
