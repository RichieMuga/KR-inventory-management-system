"use client";

import { useState } from "react";
import { UserPlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toggleUserModal } from "@/lib/features/modals/user-creation-modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";

interface User {
  payrollNumber: string;
  firstName: string;
  lastName: string;
  role: "Admin" | "Keeper" | "Viewer";
}


const roleOptions = ["Admin", "Keeper", "Viewer"] as const;

export default function CreateUserModal() {
  const [user, setUser] = useState<User>({
    payrollNumber: "",
    firstName: "",
    lastName: "",
    role: "Viewer",
  });

  const dispatch = useDispatch()

  const { isUserModalOpen } = useSelector((state: RootState) => state.userModal)

  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});

  const updateUser = (field: keyof User, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof User, string>> = {};

    if (!user.payrollNumber.trim()) {
      newErrors.payrollNumber = "Payroll number is required";
    }
    if (!user.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!user.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!user.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    console.log("Saved")
  };

  const handleClose = () => {
    dispatch(toggleUserModal())
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-900 text-white";
      case "Keeper":
        return "bg-orange-600 text-white";
      case "Viewer":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isUserModalOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold text-red-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create New User
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Add a new user to the system with their details and role assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">User Information</h3>
              <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Payroll Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. P011"
                  value={user.payrollNumber}
                  onChange={(e) => updateUser("payrollNumber", e.target.value)}
                  className={errors.payrollNumber ? "border-red-500" : ""}
                />
                {errors.payrollNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.payrollNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. John"
                    value={user.firstName}
                    onChange={(e) => updateUser("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Doe"
                    value={user.lastName}
                    onChange={(e) => updateUser("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Role <span className="text-red-500">*</span>
                </label>
                <Select
                  value={user.role}
                  onValueChange={(value) => updateUser("role", value)}
                >
                  <SelectTrigger
                    className={errors.role ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getRoleColor(role)} text-xs px-2 py-0.5`}
                          >
                            {role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Payroll Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. P011"
                  value={user.payrollNumber}
                  onChange={(e) => updateUser("payrollNumber", e.target.value)}
                  className={errors.payrollNumber ? "border-red-500" : ""}
                />
                {errors.payrollNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.payrollNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Role <span className="text-red-500">*</span>
                </label>
                <Select
                  value={user.role}
                  onValueChange={(value) => updateUser("role", value)}
                >
                  <SelectTrigger
                    className={errors.role ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getRoleColor(role)} text-xs px-2 py-0.5`}
                          >
                            {role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. John"
                  value={user.firstName}
                  onChange={(e) => updateUser("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Doe"
                  value={user.lastName}
                  onChange={(e) => updateUser("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Role Permissions:
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              {user.role === "Admin" && (
                <p>
                  • Full system access including user management and system
                  configuration
                </p>
              )}
              {user.role === "Keeper" && (
                <p>
                  • Can manage assets, update inventory, and handle asset
                  assignments
                </p>
              )}
              {user.role === "Viewer" && (
                <p>• Read-only access to view assets and reports</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-red-800 hover:bg-red-900 text-white w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
