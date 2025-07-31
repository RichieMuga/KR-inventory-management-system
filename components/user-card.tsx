import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BadgeIcon as IdCard, Briefcase } from "lucide-react"

interface UserCardProps {
  user: {
    payrollNumber: string
    firstName: string
    lastName: string
    role: "Admin" | "Keeper" | "Viewer"
  }
}

export function UserCard({ user }: UserCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-kr-maroon-dark text-white"
      case "Keeper":
        return "bg-kr-orange-dark text-white"
      case "Viewer":
        return "bg-gray-200 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-kr-maroon-dark">
          {user.firstName} {user.lastName}
        </CardTitle>
        <Badge className={`${getRoleColor(user.role)} px-2 py-1 rounded-full text-xs`}>{user.role}</Badge>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <IdCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Payroll No:</span> {user.payrollNumber}
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Role:</span> {user.role}
        </div>
      </CardContent>
    </Card>
  )
}
