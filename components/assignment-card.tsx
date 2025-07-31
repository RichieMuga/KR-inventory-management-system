import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Hash } from "lucide-react"

interface AssignmentCardProps {
  assignment: {
    id: string
    assetName: string
    serialNumber: string
    assignedTo: string
    assignmentDate: string
    returnDate: string
    status: "Active" | "Returned" | "Overdue"
  }
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Returned":
        return "bg-gray-100 text-gray-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{assignment.assetName}</CardTitle>
        <Badge className={`${getStatusColor(assignment.status)} px-2 py-1 rounded-full text-xs`}>
          {assignment.status}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center">
          <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Serial Number:</span>
          <span className="ml-auto font-medium">{assignment.serialNumber}</span>
        </div>
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Assigned To:</span>
          <span className="ml-auto font-medium">{assignment.assignedTo}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Assignment Date:</span>
          <span className="ml-auto font-medium">{assignment.assignmentDate}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Return Date:</span>
          <span className="ml-auto font-medium">{assignment.returnDate}</span>
        </div>
      </CardContent>
    </Card>
  )
}
