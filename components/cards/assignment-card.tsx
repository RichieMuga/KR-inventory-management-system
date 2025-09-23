import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Tag } from "lucide-react"

interface AssignmentCardProps {
  assignment: {
    id: string
    assetName: string
    assignedTo: string
    assignedBy: string
    dateIssued: string
    dateDue?: string
    dateReturned?: string
    conditionIssued: string
    conditionReturned?: string
    notes?: string
  }
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const isReturned = !!assignment.dateReturned
  const statusBadge = isReturned ? (
    <Badge className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Returned</Badge>
  ) : (
    <Badge className="bg-kr-orange-dark text-white px-2 py-1 rounded-full text-xs">Outstanding</Badge>
  )

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-kr-maroon-dark">{assignment.assetName}</CardTitle>
        {statusBadge}
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Assigned To:</span> {assignment.assignedTo}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Issued:</span> {assignment.dateIssued}
        </div>
        {assignment.dateDue && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Due:</span> {assignment.dateDue}
          </div>
        )}
        {isReturned && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Returned:</span> {assignment.dateReturned}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Condition (Issued):</span> {assignment.conditionIssued}
        </div>
        {assignment.conditionReturned && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Condition (Returned):</span> {assignment.conditionReturned}
          </div>
        )}
        {assignment.notes && <div className="text-xs text-muted-foreground mt-1">Notes: {assignment.notes}</div>}
      </CardContent>
    </Card>
  )
}
