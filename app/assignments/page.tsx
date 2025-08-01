import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AssignmentCard } from "@/components/assignment-card"; // Import the new card component

interface Assignment {
  id: string;
  assetName: string;
  assignedTo: string;
  assignedBy: string;
  dateIssued: string;
  dateDue?: string;
  dateReturned?: string;
  conditionIssued: string;
  conditionReturned?: string;
  notes?: string;
}

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "A001",
    assetName: "Samsung TV Remote",
    assignedTo: "Jane Smith",
    assignedBy: "John Doe",
    dateIssued: "2024-07-20",
    dateDue: "2025-07-20",
    conditionIssued: "New",
    notes: "For Conference Room 3 TV",
  },
  {
    id: "A002",
    assetName: "USB Flash Drive (64GB)",
    assignedTo: "David Green",
    assignedBy: "Alice Brown",
    dateIssued: "2024-07-27",
    conditionIssued: "Good",
    notes: "New employee onboarding",
  },
  {
    id: "A003",
    assetName: "Projector (Epson)",
    assignedTo: "Chris Wilson",
    assignedBy: "Michael Black",
    dateIssued: "2024-07-15",
    dateReturned: "2024-07-28",
    conditionIssued: "Good",
    conditionReturned: "Good",
    notes: "Used for training session",
  },
  {
    id: "A004",
    assetName: "24-inch Dell Monitor",
    assignedTo: "Emily Davis",
    assignedBy: "Sarah White",
    dateIssued: "2024-07-01",
    conditionIssued: "Good",
    notes: "Standard office setup",
  },
  {
    id: "A005",
    assetName: "Wireless Mouse (Logitech)",
    assignedTo: "Olivia Taylor",
    assignedBy: "John Doe",
    dateIssued: "2024-06-25",
    conditionIssued: "Good",
    notes: "Issued with new laptop",
  },
];

export default function AssignmentsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <h1 className="text-3xl font-bold text-kr-maroon-dark">
          Asset Assignments
        </h1>

        {/* Mobile View: Cards */}
        <div className="grid gap-4 md:hidden">
          {MOCK_ASSIGNMENTS.length > 0 ? (
            MOCK_ASSIGNMENTS.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No assignments found.
            </p>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-kr-maroon text-white hover:bg-kr-maroon">
                <TableHead className="text-white">Asset Name</TableHead>
                <TableHead className="text-white">Assigned To</TableHead>
                <TableHead className="text-white">Assigned By</TableHead>
                <TableHead className="text-white">Date Issued</TableHead>
                <TableHead className="text-white">Date Due</TableHead>
                <TableHead className="text-white">Date Returned</TableHead>
                <TableHead className="text-white">Condition Issued</TableHead>
                <TableHead className="text-white">Condition Returned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ASSIGNMENTS.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    {assignment.assetName}
                  </TableCell>
                  <TableCell>{assignment.assignedTo}</TableCell>
                  <TableCell>{assignment.assignedBy}</TableCell>
                  <TableCell>{assignment.dateIssued}</TableCell>
                  <TableCell>{assignment.dateDue || "N/A"}</TableCell>
                  <TableCell>
                    {assignment.dateReturned ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {assignment.dateReturned}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-kr-orange-dark text-white"
                      >
                        Outstanding
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{assignment.conditionIssued}</TableCell>
                  <TableCell>{assignment.conditionReturned || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
