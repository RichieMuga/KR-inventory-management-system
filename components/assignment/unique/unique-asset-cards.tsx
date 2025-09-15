import { Eye, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UniqueAssignment {
  id: string;
  assetName: string;
  serialNumber: string;
  assignedTo: string;
  assignedBy: string;
  dateIssued: string;
  conditionIssued: string;
  quantityIssued: number;
  quantityRemaining: number;
  status: string;
  dateReturned: string | null;
  conditionReturned: string | null;
  locationName: string;
  notes: string;
}

interface Props {
  assignments: UniqueAssignment[];
  onView: (assignment: UniqueAssignment) => void;
  onDelete: (assignment: UniqueAssignment) => void;
}

export default function UniqueAssetsCardsMobile({
  assignments,
  onView,
  onDelete,
}: Props) {
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
          <Badge className="bg-green-500 hover:bg-green-600">Returned</Badge>
        );
      case "Not in use":
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">Not in use</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
        );
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No unique asset assignments found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="bg-white p-4 rounded-lg shadow border space-y-3"
        >
          {/* Header with Asset Name and Status */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{assignment.assetName}</h3>
              <p className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                SN: {assignment.serialNumber}
              </p>
            </div>
            <div className="ml-4">{getStatusBadge(assignment.status)}</div>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {assignment.locationName}
          </div>

          {/* Assignment Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">
                <strong>Assigned To:</strong>
              </p>
              <p className="font-medium">{assignment.assignedTo}</p>
            </div>
            <div>
              <p className="text-gray-500">
                <strong>Assigned By:</strong>
              </p>
              <p className="font-medium">{assignment.assignedBy}</p>
            </div>
          </div>

          {/* Date and Condition Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">
                <strong>Date Issued:</strong>
              </p>
              <p>{assignment.dateIssued}</p>
            </div>
            <div>
              <p className="text-gray-500">
                <strong>Condition Issued:</strong>
              </p>
              <Badge variant="outline" className="capitalize text-xs">
                {assignment.conditionIssued}
              </Badge>
            </div>
          </div>

          {/* Return Details (if applicable) */}
          {assignment.dateReturned && (
            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
              <div>
                <p className="text-gray-500">
                  <strong>Date Returned:</strong>
                </p>
                <p>{assignment.dateReturned}</p>
              </div>
              <div>
                <p className="text-gray-500">
                  <strong>Condition Returned:</strong>
                </p>
                {assignment.conditionReturned ? (
                  <Badge variant="outline" className="capitalize text-xs">
                    {assignment.conditionReturned}
                  </Badge>
                ) : (
                  <span>-</span>
                )}
              </div>
            </div>
          )}

          {/* Notes (if any) */}
          {assignment.notes && (
            <div className="text-sm border-t pt-3">
              <p className="text-gray-500">
                <strong>Notes:</strong>
              </p>
              <p className="text-gray-700 mt-1">{assignment.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(assignment)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" /> View Details
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(assignment)}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
