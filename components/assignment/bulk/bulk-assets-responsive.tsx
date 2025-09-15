import BulkAssetsTableDesktop from "@/components/assignment/bulk/bulk-assets-table";
import BulkAssetsCardsMobile from "@/components/assignment/bulk/bulk-assets-cards";

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
}

interface Props {
  assignments: BulkAssignment[];
  onView: (assignment: BulkAssignment) => void;
  onDelete: (assignment: BulkAssignment) => void;
}

export default function BulkAssetsTable({
  assignments,
  onView,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <BulkAssetsTableDesktop
          assignments={assignments}
          onView={onView}
          onDelete={onDelete}
        />
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden">
        <BulkAssetsCardsMobile
          assignments={assignments}
          onView={onView}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
