"use client";

import { Save } from "lucide-react";
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
import { useDispatch, useSelector } from "react-redux";
import { toggleBulkModal } from "@/lib/features/modals/asset-modal-buttons";
import { RootState } from "@/lib/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api/axiosInterceptor"; // Update with correct path

interface Location {
  locationId: number;
  regionName: string;
  departmentName: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LocationsResponse {
  success: boolean;
  data: Location[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
  };
}

interface BulkAssetFormData {
  name: string;
  locationId: number;
  keeperPayrollNumber: string;
  modelNumber: string;
  minimumThreshold: number;
  quantity: number;
}

interface CreateBulkAssetResponse {
  message: string;
  createdBy: string;
  result: {
    assetId: number;
    name: string;
    keeperPayrollNumber: string;
    locationId: number;
    serialNumber: string | null;
    isBulk: boolean;
    individualStatus: string | null;
    bulkStatus: string;
    currentStockLevel: number;
    minimumThreshold: number;
    lastRestocked: string;
    modelNumber: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export default function BulkAssetModal() {
  const dispatch = useDispatch();
  const { isBulkAssetModalOpen } = useSelector(
    (state: RootState) => state.assetModal,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BulkAssetFormData>({
    defaultValues: {
      name: "",
      locationId: 0,
      keeperPayrollNumber: "",
      modelNumber: "",
      minimumThreshold: 0,
      quantity: 0,
    },
  });

  // Fetch locations using React Query
  const {
    data: locationsData,
    isLoading: isLoadingLocations,
    error: locationsError,
  } = useQuery<LocationsResponse, Error>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await api.get("/locations?page=1&limit=100");
      return response.data;
    },
    enabled: isBulkAssetModalOpen, // Only fetch when modal is open
  });

  // Create bulk asset mutation
  const createBulkAssetMutation = useMutation<
    CreateBulkAssetResponse,
    Error,
    BulkAssetFormData
  >({
    mutationFn: async (formData: BulkAssetFormData) => {
      const response = await api.post("/", formData);
      return response.data;
    },
    onSuccess: () => {
      dispatch(toggleBulkModal());
      reset();
      // Refresh the page
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error creating bulk asset:", error);
      // You can add toast notifications here
    },
  });

  const onSubmit = async (data: BulkAssetFormData) => {
    await createBulkAssetMutation.mutateAsync(data);
  };

  const handleClose = () => {
    dispatch(toggleBulkModal());
    reset();
  };

  const selectedLocationId = watch("locationId");

  return (
    <Dialog open={isBulkAssetModalOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold text-red-900">
            Add Bulk Asset
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Add a consumable item like toner cartridges, cables, and other bulk
            inventory items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Mobile Card Layout */}
            <div className="lg:hidden">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Bulk Asset</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800">
                      Bulk Item
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Asset Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Blue Ball Point pens"
                      {...register("name", {
                        required: "Asset name is required",
                      })}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Model Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. BIC"
                      {...register("modelNumber", {
                        required: "Model number is required",
                      })}
                    />
                    {errors.modelNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.modelNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Keeper Payroll Number{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. A001"
                      {...register("keeperPayrollNumber", {
                        required: "Keeper payroll number is required",
                      })}
                    />
                    {errors.keeperPayrollNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.keeperPayrollNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Minimum Threshold{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 5000"
                        {...register("minimumThreshold", {
                          required: "Minimum threshold is required",
                          valueAsNumber: true,
                          min: {
                            value: 0,
                            message: "Minimum threshold must be positive",
                          },
                        })}
                      />
                      {errors.minimumThreshold && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.minimumThreshold.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 400"
                        {...register("quantity", {
                          required: "Quantity is required",
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: "Quantity must be at least 1",
                          },
                        })}
                      />
                      {errors.quantity && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.quantity.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedLocationId?.toString() || ""}
                      onValueChange={(value) =>
                        setValue("locationId", parseInt(value), {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingLocations ? (
                          <SelectItem value="loading" disabled>
                            Loading locations...
                          </SelectItem>
                        ) : locationsError ? (
                          <SelectItem value="error" disabled>
                            Error loading locations
                          </SelectItem>
                        ) : (
                          locationsData?.data.map((location) => (
                            <SelectItem
                              key={location.locationId}
                              value={location.locationId.toString()}
                            >
                              {location.regionName} - {location.departmentName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.locationId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.locationId.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Form Layout */}
            <div className="hidden lg:block space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Blue Ball Point pens"
                    {...register("name", {
                      required: "Asset name is required",
                    })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Model Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. BIC"
                    {...register("modelNumber", {
                      required: "Model number is required",
                    })}
                  />
                  {errors.modelNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.modelNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Keeper Payroll Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. A001"
                    {...register("keeperPayrollNumber", {
                      required: "Keeper payroll number is required",
                    })}
                  />
                  {errors.keeperPayrollNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.keeperPayrollNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Minimum Threshold <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    {...register("minimumThreshold", {
                      required: "Minimum threshold is required",
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "Minimum threshold must be positive",
                      },
                    })}
                  />
                  {errors.minimumThreshold && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.minimumThreshold.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 400"
                    {...register("quantity", {
                      required: "Quantity is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Quantity must be at least 1",
                      },
                    })}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Location <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedLocationId?.toString() || ""}
                  onValueChange={(value) =>
                    setValue("locationId", parseInt(value), {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLocations ? (
                      <SelectItem value="loading" disabled>
                        Loading locations...
                      </SelectItem>
                    ) : locationsError ? (
                      <SelectItem value="error" disabled>
                        Error loading locations
                      </SelectItem>
                    ) : (
                      locationsData?.data.map((location) => (
                        <SelectItem
                          key={location.locationId}
                          value={location.locationId.toString()}
                        >
                          {location.regionName} - {location.departmentName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.locationId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.locationId.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-800 hover:bg-red-900 text-white w-full sm:w-auto"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Bulk Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
