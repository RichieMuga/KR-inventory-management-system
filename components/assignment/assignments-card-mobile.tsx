import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Assignment } from "@/types/assignment";
import { getStatusBadge } from "@/components/assignment/helpers";

interface Props {
  assignments: Assignment[];
  onView: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
}

export default function AssignmentCardsMobile({
  assignments,
  onView,
  onDelete,
}: Props) {
  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="bg-white p-4 rounded-lg shadow border space-y-2"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{assignment.assetName}</h3>
            {getStatusBadge(assignment.status)}
          </div>
          <p className="text-sm text-gray-500">
            <strong>Assigned To:</strong> {assignment.assignedTo}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Assigned By:</strong> {assignment.assignedBy}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Date Issued:</strong> {assignment.dateIssued}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Condition Issued:</strong> {assignment.conditionIssued}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Qty Issued:</strong> {assignment.quantityIssued}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Qty Remaining:</strong> {assignment.quantityRemaining}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Date Returned:</strong> {assignment.dateReturned || "-"}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Condition Returned:</strong>{" "}
            {assignment.conditionReturned || "-"}
          </p>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(assignment)}
            >
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(assignment)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
