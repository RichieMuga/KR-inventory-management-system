"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Save, Loader2 } from "lucide-react";
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
import { api } from "@/lib/api/axiosInterceptor"; // Your axios instance
import { toast } from "sonner"; // Assuming you're using sonner for toasts

interface User {
  payrollNumber: string;
  firstName: string;
  lastName: string;
  role: "admin" | "keeper" | "viewer";
  defaultLocationId?: number;
}

interface CreateUserResponse {
  success: boolean;
  createdBy: {
    payrollNumber: string;
    role: string;
  };
  user: {
    payrollNumber: string;
    firstName: string;
    lastName: string;
    role: string;
    password: string;
    mustChangePassword: boolean;
    defaultLocationId: number;
    createdAt: string;
    updatedAt: string;
    defaultLocation: {
      locationId: number;
      regionName: string;
      departmentName: string;
      notes: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "keeper", label: "Keeper" },
  { value: "viewer", label: "Viewer" },
] as const;

// API function
const createUser = async (userData: User): Promise<CreateUserResponse> => {
  const response = await api.post("/users", {
    ...userData,
    defaultLocationId: userData.defaultLocationId || 1, // Default to location 1
  });
  return response.data;
};

export default function CreateUserModal() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { isUserModalOpen } = useSelector(
    (state: RootState) => state.userModal,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    clearErrors,
  } = useForm<User>({
    defaultValues: {
      payrollNumber: "",
      firstName: "",
      lastName: "",
      role: "viewer",
      defaultLocationId: 1,
    },
  });

  const currentRole = watch("role");

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      toast.success(
        `User ${data.user.firstName} ${data.user.lastName} created successfully!`,
      );
      // Invalidate and refetch users query
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create user";
      toast.error(errorMessage);
    },
  });

  const handleClose = () => {
    reset();
    dispatch(toggleUserModal());
  };

  const onSubmit = (data: User) => {
    createUserMutation.mutate(data);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-900 text-white";
      case "keeper":
        return "bg-orange-600 text-white";
      case "viewer":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "• Full system access including user management and system configuration";
      case "keeper":
        return "• Can manage assets, update inventory, and handle asset assignments";
      case "viewer":
        return "• Read-only access to view assets and reports";
      default:
        return "";
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">User Information</h3>
              <Badge className={getRoleColor(currentRole)}>
                {roleOptions.find((r) => r.value === currentRole)?.label}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Payroll Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. P011"
                  {...register("payrollNumber", {
                    required: "Payroll number is required",
                    pattern: {
                      value: /^[A-Za-z0-9]+$/,
                      message:
                        "Payroll number should contain only letters and numbers",
                    },
                  })}
                  className={errors.payrollNumber ? "border-red-500" : ""}
                />
                {errors.payrollNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.payrollNumber.message}
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
                    {...register("firstName", {
                      required: "First name is required",
                      minLength: {
                        value: 2,
                        message: "First name must be at least 2 characters",
                      },
                    })}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Doe"
                    {...register("lastName", {
                      required: "Last name is required",
                      minLength: {
                        value: 2,
                        message: "Last name must be at least 2 characters",
                      },
                    })}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Role <span className="text-red-500">*</span>
                </label>
                <Select
                  value={currentRole}
                  onValueChange={(value) => {
                    setValue("role", value as "admin" | "keeper" | "viewer");
                    clearErrors("role");
                  }}
                >
                  <SelectTrigger
                    className={errors.role ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getRoleColor(role.value)} text-xs px-2 py-0.5`}
                          >
                            {role.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.role.message}
                  </p>
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
                  {...register("payrollNumber", {
                    required: "Payroll number is required",
                    pattern: {
                      value: /^[A-Za-z0-9]+$/,
                      message:
                        "Payroll number should contain only letters and numbers",
                    },
                  })}
                  className={errors.payrollNumber ? "border-red-500" : ""}
                />
                {errors.payrollNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.payrollNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Role <span className="text-red-500">*</span>
                </label>
                <Select
                  value={currentRole}
                  onValueChange={(value) => {
                    setValue("role", value as "admin" | "keeper" | "viewer");
                    clearErrors("role");
                  }}
                >
                  <SelectTrigger
                    className={errors.role ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getRoleColor(role.value)} text-xs px-2 py-0.5`}
                          >
                            {role.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.role.message}
                  </p>
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
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: {
                      value: 2,
                      message: "First name must be at least 2 characters",
                    },
                  })}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Doe"
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: {
                      value: 2,
                      message: "Last name must be at least 2 characters",
                    },
                  })}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Role Permissions:
            </h4>
            <div className="text-xs text-gray-600">
              <p>{getRolePermissions(currentRole)}</p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-800 hover:bg-red-900 text-white w-full sm:w-auto"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
