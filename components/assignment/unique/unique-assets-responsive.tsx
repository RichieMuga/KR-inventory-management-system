import UniqueAssetsTableDesktop from "@/components/assignment/unique/unique-assets-table";
import UniqueAssetsCardsMobile from "@/components/assignment/unique/unique-asset-cards";

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

export default function UniqueAssetsResponsive({
  assignments,
  onView,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <UniqueAssetsTableDesktop
          assignments={assignments}
          onView={onView}
          onDelete={onDelete}
        />
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden">
        <UniqueAssetsCardsMobile
          assignments={assignments}
          onView={onView}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
