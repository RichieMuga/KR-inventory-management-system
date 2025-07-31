import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Briefcase, Package } from "lucide-react"

interface UserCardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    department: string
    assetsAssigned: number
  }
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{user.name}</CardTitle>
        <User className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Email:</span>
          <span className="ml-auto font-medium">{user.email}</span>
        </div>
        <div className="flex items-center">
          <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Role:</span>
          <span className="ml-auto font-medium">{user.role}</span>
        </div>
        <div className="flex items-center">
          <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Department:</span>
          <span className="ml-auto font-medium">{user.department}</span>
        </div>
        <div className="flex items-center">
          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Assets Assigned:</span>
          <span className="ml-auto font-medium">{user.assetsAssigned}</span>
        </div>
      </CardContent>
    </Card>
  )
}
