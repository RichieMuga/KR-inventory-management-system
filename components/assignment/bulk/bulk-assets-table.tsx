import { Eye, Trash2, MoreVertical, AlertTriangle, TrendingUp } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BulkAssignment {
  id: string;
  assetName: string;
  assignedTo: string;
  assignedBy: string;
  dateIssued: string;
  conditionIssued: string;
  quantityIssued: number;
  quantityReturned: number;
  quantityRemaining: number;
  status: string;
  dateReturned: string | null;
  conditionReturned: string | null;
  locationName: string;
  notes: string;
  batchNumber?: string;
  // New stock-related properties
  currentStockLevel: number;
  minimumThreshold: number;
  isLowStock: boolean;
  lastRestocked: string | null;
}

interface Props {
  assignments: BulkAssignment[];
  onView: (assignment: BulkAssignment) => void;
  onDelete: (assignment: BulkAssignment) => void;
}

export default function BulkAssetsTableDesktop({
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
      case "Partially returned":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Partially returned
          </Badge>
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

  const getStockDisplay = (
    currentStock: number,
    minimumThreshold: number,
    isLowStock: boolean,
    lastRestocked: string | null,
  ) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-sm cursor-help">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                  {currentStock.toLocaleString()}
                </span>
                {isLowStock && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="text-xs text-gray-500">
                Min: {minimumThreshold.toLocaleString()}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p><strong>Current Stock:</strong> {currentStock.toLocaleString()}</p>
              <p><strong>Minimum Threshold:</strong> {minimumThreshold.toLocaleString()}</p>
              {lastRestocked && (
                <p><strong>Last Restocked:</strong> {lastRestocked}</p>
              )}
              {isLowStock && (
                <p className="text-red-500 font-medium mt-1">⚠️ Low Stock Alert</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No bulk asset assignments found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-kr-maroon text-white">
          <TableRow className="text-white">
            <TableHead className="text-white">Asset Name</TableHead>
            <TableHead className="text-white">Batch Number</TableHead>
            <TableHead className="text-white">Assigned To</TableHead>
            <TableHead className="text-white">Assigned By</TableHead>
            <TableHead className="text-white">Date Issued</TableHead>
            <TableHead className="text-white">Condition Issued</TableHead>
            <TableHead className="text-white">Current Stock</TableHead>
            <TableHead className="text-white">Location</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Date Returned</TableHead>
            <TableHead className="text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id} className={assignment.isLowStock ? 'bg-red-50' : ''}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {assignment.assetName}
                  {assignment.isLowStock && (
                    <Badge variant="destructive" className="text-xs">
                      Low Stock
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm text-blue-600">
                {assignment.batchNumber || "-"}
              </TableCell>
              <TableCell>{assignment.assignedTo}</TableCell>
              <TableCell>{assignment.assignedBy}</TableCell>
              <TableCell>{assignment.dateIssued}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {assignment.conditionIssued}
                </Badge>
              </TableCell>
              <TableCell>
                {getStockDisplay(
                  assignment.currentStockLevel,
                  assignment.minimumThreshold,
                  assignment.isLowStock,
                  assignment.lastRestocked,
                )}
              </TableCell>
              <TableCell className="text-sm">
                {assignment.locationName}
              </TableCell>
              <TableCell>{getStatusBadge(assignment.status)}</TableCell>
              <TableCell>{assignment.dateReturned || "-"}</TableCell>
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