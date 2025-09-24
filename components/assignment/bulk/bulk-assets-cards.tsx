import { Eye, Trash2, MapPin, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function BulkAssetsCardsMobile({
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

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No bulk asset assignments found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className={`bg-white p-4 rounded-lg shadow border space-y-3 ${
            assignment.isLowStock ? 'border-red-200 bg-red-50' : ''
          }`}
        >
          {/* Low Stock Alert */}
          {assignment.isLowStock && (
            <Alert className="border-red-300 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                <strong>Low Stock Alert:</strong> Current stock ({assignment.currentStockLevel}) is below minimum threshold ({assignment.minimumThreshold})
              </AlertDescription>
            </Alert>
          )}

          {/* Header with Asset Name and Status */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {assignment.assetName}
                {assignment.isLowStock && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </h3>
              {assignment.batchNumber && (
                <p className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                  Batch: {assignment.batchNumber}
                </p>
              )}
            </div>
            <div className="ml-4">{getStatusBadge(assignment.status)}</div>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {assignment.locationName}
          </div>

          {/* Stock Information */}
          <div className={`p-3 rounded-lg ${assignment.isLowStock ? 'bg-red-100' : 'bg-gray-50'}`}>
            <div className="flex items-center mb-2">
              <Package className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Current Stock Level
              </span>
            </div>
            
            <div className="space-y-2">
              {/* Current Stock Display */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className={`font-bold text-xl ${assignment.isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                  {assignment.currentStockLevel.toLocaleString()}
                </span>
              </div>
              
              {/* Minimum Threshold */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Minimum Required:</span>
                <span className="font-medium text-gray-800">
                  {assignment.minimumThreshold.toLocaleString()}
                </span>
              </div>

              {/* Last Restocked */}
              {assignment.lastRestocked && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Restocked:</span>
                  <span className="text-sm text-gray-700">
                    {assignment.lastRestocked}
                  </span>
                </div>
              )}

              {/* Stock Status Indicator */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock Status:</span>
                  <div className="flex items-center gap-1">
                    {assignment.isLowStock ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600">Low Stock</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">Good Level</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
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

          {/* Quantity Information (for reference) */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <Package className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Assignment Quantities
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <p className="font-bold text-lg text-blue-600">
                  {assignment.quantityIssued}
                </p>
                <p className="text-xs text-gray-600">Issued</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-green-600">
                  {assignment.quantityReturned}
                </p>
                <p className="text-xs text-gray-600">Returned</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-orange-600">
                  {assignment.quantityRemaining}
                </p>
                <p className="text-xs text-gray-600">Outstanding</p>
              </div>
            </div>
          </div>

          {/* Return Details (if applicable) */}
          {assignment.dateReturned && (
            <div className="border-t pt-3 space-y-2">
              <h4 className="font-medium text-sm text-gray-700">
                Return Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
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