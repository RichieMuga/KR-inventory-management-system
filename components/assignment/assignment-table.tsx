import { Assignment } from "@/types/assignment";
import AssignmentTableDesktop from "@/components/assignment/assignments-table-desktop";
import AssignmentCardsMobile from "@/components/assignment/assignments-card-mobile";

interface Props {
  assignments: Assignment[];
  onView: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
}

export default function AssignmentTable({
  assignments,
  onView,
  onDelete,
}: Props) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No assignments found for this category.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="hidden md:block">
        <AssignmentTableDesktop
          assignments={assignments}
          onView={onView}
          onDelete={onDelete}
        />
      </div>
      <div className="block md:hidden">
        <AssignmentCardsMobile
          assignments={assignments}
          onView={onView}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
