// components/user-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin, User } from "lucide-react";

interface UserCardProps {
  user: {
    payrollNumber: string;
    firstName: string;
    lastName: string;
    role: "Admin" | "Keeper" | "Viewer";
    mustChangePassword: boolean;
    defaultLocationId: number | null;
    defaultLocation?: {
      locationId: number;
      departmentName: string;
      regionName: string;
      notes: string;
    } | null;
  };
  onEdit?: (user: any) => void;
  onDelete?: (user: any) => void;
}

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-kr-maroon-dark text-white";
    case "keeper":
      return "bg-kr-orange-dark text-white";
    case "viewer":
      return "bg-gray-200 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-kr-maroon-dark">
            {user.firstName} {user.lastName}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">
            #{user.payrollNumber}
          </span>
          {(onEdit || onDelete) && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(user)}
                  className="h-8 w-8 text-kr-orange hover:text-kr-orange-dark hover:bg-orange-50"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(user)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Role:</span>
          <Badge className={`${getRoleColor(user.role)} px-2 py-1 text-xs`}>
            {user.role}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Location:</span>
          {user.defaultLocation ? (
            <span className="text-sm">
              {user.defaultLocation.departmentName} ({user.defaultLocation.regionName})
            </span>
          ) : (
            <span className="text-gray-400 text-sm">No location assigned</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Password Change:</span>
          <Badge
            className={`px-2 py-1 text-xs ${
              user.mustChangePassword
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {user.mustChangePassword ? "Required" : "Not Required"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}