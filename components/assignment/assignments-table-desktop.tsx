import { Eye, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Assignment } from "@/types/assignment";

interface AssignmentTableProps {
  assignments: Assignment[];
  onView: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
}

export default function AssignmentTable({
  assignments,
  onView,
  onDelete,
}: AssignmentTableProps) {
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
        No assignments found for this category.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-kr-maroon text-white">
          <TableRow className="text-white">
            <TableHead className="text-white">Asset Name</TableHead>
            <TableHead className="text-white">Assigned To</TableHead>
            <TableHead className="text-white">Assigned By</TableHead>
            <TableHead className="text-white">Date Issued</TableHead>
            <TableHead className="text-white">Condition Issued</TableHead>
            <TableHead className="text-white">Qty Issued</TableHead>
            <TableHead className="text-white">Qty Remaining</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Date Returned</TableHead>
            <TableHead className="text-white">Condition Returned</TableHead>
            <TableHead className="text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>{assignment.assetName}</TableCell>
              <TableCell>{assignment.assignedTo}</TableCell>
              <TableCell>{assignment.assignedBy}</TableCell>
              <TableCell>{assignment.dateIssued}</TableCell>
              <TableCell>{assignment.conditionIssued}</TableCell>
              <TableCell>{assignment.quantityIssued}</TableCell>
              <TableCell>{assignment.quantityRemaining}</TableCell>
              <TableCell>{getStatusBadge(assignment.status)}</TableCell>
              <TableCell>{assignment.dateReturned || "-"}</TableCell>
              <TableCell>{assignment.conditionReturned || "-"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onView(assignment)}>
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(assignment)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Assignment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
