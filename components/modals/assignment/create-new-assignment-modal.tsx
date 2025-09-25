import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axiosInterceptor"; // Adjust path as needed
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface Asset {
  assetId: number;
  name: string;
  serialNumber?: string;
  isBulk: boolean;
  currentStockLevel?: number;
  location: {
    locationId: number;
    departmentName: string;
    regionName: string;
  };
}

interface Location {
  locationId: number;
  regionName: string;
  departmentName: string;
  notes: string;
}

interface User {
  payrollNumber: string;
  firstName: string;
  lastName: string;
  defaultLocation?: {
    locationId: number;
    departmentName: string;
    regionName: string;
  };
}

interface AssignmentFormData {
  assetId: number;
  assignedTo: string;
  assignedBy: string;
  locationId: number;
  conditionIssued: string;
  notes?: string;
  quantity?: number; // Only for bulk assets
}

interface NewAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetType: "bulk" | "unique";
  onSuccess?: () => void;
}

// API functions
const fetchAssets = async (assetType: "bulk" | "unique"): Promise<Asset[]> => {
  const endpoint = assetType === "unique" ? "/uniqueAssets" : "/";
  const response = await api.get(`${endpoint}?status=not_in_use`);
  return response.data.data || [];
};

const fetchLocations = async (): Promise<Location[]> => {
  const response = await api.get("/locations");
  return response.data.data || [];
};

const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data.data || [];
};

const createAssignment = async (data: AssignmentFormData & { assetType: "bulk" | "unique" }) => {
  const endpoint = data.assetType === "unique" ? "/assignments/unique" : "/assignments";
  
  const requestBody = data.assetType === "unique"
    ? {
        assetId: data.assetId,
        assignedTo: data.assignedTo,
        assignedBy: data.assignedBy,
        locationId: data.locationId,
        conditionIssued: data.conditionIssued,
        notes: data.notes || ""
      }
    : {
        assetId: data.assetId,
        assignedTo: data.assignedTo,
        assignedBy: data.assignedBy,
        locationId: data.locationId,
        quantity: data.quantity || 1,
        conditionIssued: data.conditionIssued,
        notes: data.notes || ""
      };

  const response = await api.post(endpoint, requestBody);
  return response.data;
};

export default function NewAssignmentDialog({
  open,
  onOpenChange,
  assetType,
  onSuccess,
}: NewAssignmentDialogProps) {
  const queryClient = useQueryClient();
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<AssignmentFormData>({
    defaultValues: {
      conditionIssued: "good",
      quantity: assetType === "bulk" ? 1 : undefined,
    },
  });

  // Queries
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets', assetType],
    queryFn: () => fetchAssets(assetType),
    enabled: open,
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    enabled: open,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: open,
  });

  // Mutation
  const createAssignmentMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      
      onOpenChange(false);
      reset();
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Failed to create assignment:', error);
      // The axios interceptor will handle 401 errors automatically
      // You might want to show a toast notification here
      // toast.error(error.response?.data?.message || "Failed to create assignment");
    },
  });

  // Reset form when dialog opens/closes or asset type changes
  useEffect(() => {
    if (open) {
      reset({
        conditionIssued: "good",
        quantity: assetType === "bulk" ? 1 : undefined,
      });
    }
  }, [open, assetType, reset]);

  const onSubmit = (data: AssignmentFormData) => {
    createAssignmentMutation.mutate({
      ...data,
      assetType,
    });
  };

  const selectedAsset = assets.find(asset => asset.assetId === watch('assetId'));
  const isLoading = assetsLoading || locationsLoading || usersLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Assignment</DialogTitle>
          <DialogDescription>
            Assign a {assetType} asset to a user
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Asset Selection */}
            <div className="col-span-2">
              <Label>Select Asset *</Label>
              <Controller
                name="assetId"
                control={control}
                rules={{ required: "Asset selection is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoading ? "Loading assets..." : "Select asset"} />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.assetId} value={asset.assetId.toString()}>
                          {asset.name}
                          {asset.serialNumber && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({asset.serialNumber})
                            </span>
                          )}
                          {asset.isBulk && asset.currentStockLevel !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              (Stock: {asset.currentStockLevel})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assetId && (
                <span className="text-sm text-red-500">{errors.assetId.message}</span>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <Label>Assigned To *</Label>
              <Controller
                name="assignedTo"
                control={control}
                rules={{ required: "Assignee is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={usersLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={usersLoading ? "Loading users..." : "Select user"} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.payrollNumber} value={user.payrollNumber}>
                          {user.firstName} {user.lastName} ({user.payrollNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assignedTo && (
                <span className="text-sm text-red-500">{errors.assignedTo.message}</span>
              )}
            </div>

            {/* Assigned By */}
            <div>
              <Label>Assigned By *</Label>
              <Controller
                name="assignedBy"
                control={control}
                rules={{ required: "Assigner is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={usersLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={usersLoading ? "Loading users..." : "Select user"} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.payrollNumber} value={user.payrollNumber}>
                          {user.firstName} {user.lastName} ({user.payrollNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assignedBy && (
                <span className="text-sm text-red-500">{errors.assignedBy.message}</span>
              )}
            </div>

            {/* Location */}
            <div>
              <Label>Location *</Label>
              <Controller
                name="locationId"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={locationsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={locationsLoading ? "Loading locations..." : "Select location"} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.locationId} value={location.locationId.toString()}>
                          {location.regionName} - {location.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.locationId && (
                <span className="text-sm text-red-500">{errors.locationId.message}</span>
              )}
            </div>

            {/* Condition Issued */}
            <div>
              <Label>Condition Issued *</Label>
              <Controller
                name="conditionIssued"
                control={control}
                rules={{ required: "Condition is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.conditionIssued && (
                <span className="text-sm text-red-500">{errors.conditionIssued.message}</span>
              )}
            </div>

            {/* Quantity (for bulk assets only) */}
            {assetType === "bulk" && (
              <div>
                <Label>Quantity *</Label>
                <Controller
                  name="quantity"
                  control={control}
                  rules={{
                    required: "Quantity is required",
                    min: { value: 1, message: "Quantity must be at least 1" },
                    max: selectedAsset?.currentStockLevel
                      ? { 
                          value: selectedAsset.currentStockLevel, 
                          message: `Quantity cannot exceed available stock (${selectedAsset.currentStockLevel})`
                        }
                      : undefined
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min="1"
                      max={selectedAsset?.currentStockLevel}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
                {errors.quantity && (
                  <span className="text-sm text-red-500">{errors.quantity.message}</span>
                )}
                {selectedAsset?.currentStockLevel && (
                  <span className="text-xs text-gray-500">
                    Available stock: {selectedAsset.currentStockLevel}
                  </span>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createAssignmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-kr-maroon hover:bg-kr-maroon-dark"
              disabled={!isValid || createAssignmentMutation.isPending || isLoading}
            >
              {createAssignmentMutation.isPending ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}