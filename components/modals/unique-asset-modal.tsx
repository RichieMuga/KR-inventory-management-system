"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, Search } from "lucide-react";
import { api } from "@/lib/api/axiosInterceptor";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch, useSelector } from "react-redux";
import { toggleUniqueModal } from "@/lib/features/modals/asset-modal-buttons";
import { RootState } from "@/lib/store";
import { toast } from "sonner";

interface UniqueAssetFormData {
  name: string;
  serialNumber: string;
  modelNumber: string;
  locationId: number | null;
  keeperPayrollNumber: string;
  individualStatus: string;
  notes: string;
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
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  search?: string;
}

const individualStatusOptions = [
  "not_in_use",
  "in_use",
  "under_repair",
  "disposed",
];

// API functions
const fetchLocations = async (
  search: string = "",
): Promise<ApiResponse<Location>> => {
  const response = await api.get("/locations", {
    params: {
      page: 1,
      limit: 50,
      search,
    },
  });
  return response.data;
};

const fetchUsers = async (search: string = ""): Promise<ApiResponse<User>> => {
  const response = await api.get("/users", {
    params: {
      page: 1,
      limit: 50,
      search,
    },
  });
  return response.data;
};

const createUniqueAsset = async (data: UniqueAssetFormData) => {
  const response = await api.post("/uniqueAssets", data);
  return response.data;
};

export default function UniqueAssetModal() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { isUniqueAssetModalOpen } = useSelector(
    (state: RootState) => state.assetModal,
  );

  const [locationSearch, setLocationSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UniqueAssetFormData>({
    defaultValues: {
      name: "",
      serialNumber: "",
      modelNumber: "",
      locationId: null,
      keeperPayrollNumber: "",
      individualStatus: "not_in_use",
      notes: "",
    },
  });

  // Fetch locations
  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations", locationSearch],
    queryFn: () => fetchLocations(locationSearch),
    enabled: isUniqueAssetModalOpen,
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", userSearch],
    queryFn: () => fetchUsers(userSearch),
    enabled: isUniqueAssetModalOpen,
  });

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: createUniqueAsset,
    onSuccess: (data) => {
      toast.success("Unique asset created successfully!");
      queryClient.invalidateQueries({ queryKey: ["uniqueAssets"] });
      handleClose();
      window.location.reload();
    },
    onError: (error) => {
      toast.error("Failed to create unique asset");
      console.error("Error creating asset:", error);
    },
  });

  const onSubmit = (data: UniqueAssetFormData) => {
    createAssetMutation.mutate(data);
  };

  const handleClose = () => {
    dispatch(toggleUniqueModal());
    reset();
    setLocationSearch("");
    setUserSearch("");
  };

  return (
    <Dialog open={isUniqueAssetModalOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold text-red-900">
            Add Unique Asset
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Add an individually tracked asset like projectors, monitors, or
            other unique equipment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mobile Card Layout */}
          <div className="lg:hidden">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Unique Asset</CardTitle>
                  <Badge className="bg-purple-100 text-purple-800">
                    Individual Item
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Asset Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Asset name is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="e.g. Dell 24-inch Monitor"
                        className={errors.name ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Serial Number */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="serialNumber"
                    control={control}
                    rules={{ required: "Serial number is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="e.g. MON-DELL-24-008"
                        className={errors.serialNumber ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.serialNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.serialNumber.message}
                    </p>
                  )}
                </div>

                {/* Model Number */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Model Number
                  </label>
                  <Controller
                    name="modelNumber"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="e.g. Dell U2414H" />
                    )}
                  />
                </div>

                {/* Location and Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="locationId"
                      control={control}
                      rules={{ required: "Location is required" }}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          value={value?.toString() || ""}
                          onValueChange={(val) => onChange(parseInt(val))}
                        >
                          <SelectTrigger
                            className={
                              errors.locationId ? "border-red-500" : ""
                            }
                          >
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-gray-400" />
                                <Input
                                  placeholder="Search locations..."
                                  value={locationSearch}
                                  onChange={(e) =>
                                    setLocationSearch(e.target.value)
                                  }
                                  className="h-8"
                                />
                              </div>
                            </div>
                            {locationsLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              locationsData?.data?.map((location) => (
                                <SelectItem
                                  key={location.locationId}
                                  value={location.locationId.toString()}
                                >
                                  {location.departmentName} -{" "}
                                  {location.regionName}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.locationId && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.locationId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Status
                    </label>
                    <Controller
                      name="individualStatus"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {individualStatusOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Keeper */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Keeper <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="keeperPayrollNumber"
                    control={control}
                    rules={{ required: "Keeper is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={
                            errors.keeperPayrollNumber ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select keeper" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="flex items-center space-x-2">
                              <Search className="h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search users..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="h-8"
                              />
                            </div>
                          </div>
                          {usersLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            usersData?.data?.map((user) => (
                              <SelectItem
                                key={user.payrollNumber}
                                value={user.payrollNumber}
                              >
                                {user.firstName} {user.lastName} (
                                {user.payrollNumber})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.keeperPayrollNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.keeperPayrollNumber.message}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Notes
                  </label>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Additional notes about the asset..."
                        rows={3}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Form Layout */}
          <div className="hidden lg:block space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Asset Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Asset name is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g. Dell 24-inch Monitor"
                      className={errors.name ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Serial Number */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="serialNumber"
                  control={control}
                  rules={{ required: "Serial number is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g. MON-DELL-24-008"
                      className={errors.serialNumber ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.serialNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.serialNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Model Number */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Model Number
                </label>
                <Controller
                  name="modelNumber"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g. Dell U2414H" />
                  )}
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Location <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="locationId"
                  control={control}
                  rules={{ required: "Location is required" }}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={value?.toString() || ""}
                      onValueChange={(val) => onChange(parseInt(val))}
                    >
                      <SelectTrigger
                        className={errors.locationId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search locations..."
                              value={locationSearch}
                              onChange={(e) =>
                                setLocationSearch(e.target.value)
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                        {locationsLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          locationsData?.data?.map((location) => (
                            <SelectItem
                              key={location.locationId}
                              value={location.locationId.toString()}
                            >
                              {location.departmentName} - {location.regionName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.locationId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.locationId.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <Controller
                  name="individualStatus"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {individualStatusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Keeper */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Keeper <span className="text-red-500">*</span>
              </label>
              <Controller
                name="keeperPayrollNumber"
                control={control}
                rules={{ required: "Keeper is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className={
                        errors.keeperPayrollNumber ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select keeper" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                      {usersLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        usersData?.data?.map((user) => (
                          <SelectItem
                            key={user.payrollNumber}
                            value={user.payrollNumber}
                          >
                            {user.firstName} {user.lastName} (
                            {user.payrollNumber})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.keeperPayrollNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.keeperPayrollNumber.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Notes
              </label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Additional notes about the asset..."
                    rows={3}
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
              disabled={isSubmitting || createAssetMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-800 hover:bg-red-900 text-white w-full sm:w-auto"
              disabled={isSubmitting || createAssetMutation.isPending}
            >
              {isSubmitting || createAssetMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Unique Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
