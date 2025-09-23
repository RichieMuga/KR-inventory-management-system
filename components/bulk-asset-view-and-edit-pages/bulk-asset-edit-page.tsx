"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  X,
  MapPin,
  User,
  Package,
  Building,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api/axiosInterceptor";

interface EditAssetPageProps {
  assetId: string;
}

interface FormData {
  quantity: number;
  minimumThreshold: number;
  keeperPayrollNumber: string;
  locationId: number;
  modelNumber: string;
  notes: string;
}

interface Location {
  locationId: number;
  regionName: string;
  departmentName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  payrollNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  mustChangePassword: boolean;
  defaultLocationId: number | null;
  createdAt: string;
  updatedAt: string;
  defaultLocation?: {
    locationId: number;
    departmentName: string;
    regionName: string;
    notes: string;
  };
}

interface Asset {
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
}

export function EditAssetPage({ assetId }: EditAssetPageProps) {
  const queryClient = useQueryClient();

  // Fetch locations
  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await api.get('/locations');
      return response.data;
    }
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    }
  });

  // Fetch current asset data
  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: async () => {
      const response = await api.get(`/view-bulk-asset/${assetId}`);
      return response.data;
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<FormData>();

  // Set form default values when asset data is loaded
  React.useEffect(() => {
    if (assetData) {
      reset({
        quantity: assetData.currentStockLevel || 0,
        minimumThreshold: assetData.minimumThreshold || 0,
        keeperPayrollNumber: assetData.keeperPayrollNumber || '',
        locationId: assetData.locationId || 0,
        modelNumber: assetData.modelNumber || '',
        notes: assetData.notes || ''
      });
    }
  }, [assetData, reset]);

  // Watch form values for real-time updates
  const watchedValues = watch();

  // Mutation for updating asset
  const updateAssetMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.patch(`/edit-bulk-asset/${assetId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch asset data
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      // Show success message or redirect
      console.log('Asset updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating asset:', error);
    }
  });

  const onSubmit = (data: FormData) => {
    updateAssetMutation.mutate(data);
  };

  const handleCancel = () => {
    // Reset form to original values
    if (assetData) {
      reset({
        quantity: assetData.currentStockLevel || 0,
        minimumThreshold: assetData.minimumThreshold || 0,
        keeperPayrollNumber: assetData.keeperPayrollNumber || '',
        locationId: assetData.locationId || 0,
        modelNumber: assetData.modelNumber || '',
        notes: assetData.notes || ''
      });
    }
  };

  const handleGoBack = () => {
    // Navigate back to asset view
    window.history.back();
  };

  // Get current keeper and location details
  const currentKeeper = usersData?.data?.find(
    (user: User) => user.payrollNumber === watchedValues.keeperPayrollNumber
  );
  const currentLocation = locationsData?.data?.find(
    (location: Location) => location.locationId === watchedValues.locationId
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (assetLoading || locationsLoading || usersLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading asset data...</span>
        </div>
      </div>
    );
  }

  if (!assetData) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Asset not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Asset
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-kr-maroon-dark">
              Edit Asset
            </h1>
            <p className="text-muted-foreground">
              Asset ID: {assetData.assetId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} type="button">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || updateAssetMutation.isPending}
            className="bg-kr-maroon hover:bg-kr-maroon-dark"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting || updateAssetMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {updateAssetMutation.isSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Asset updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {updateAssetMutation.isError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to update asset. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Status Preview */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{assetData.name}</h3>
              <p className="text-sm text-muted-foreground">
                {currentLocation?.departmentName} • {currentKeeper?.firstName}{" "}
                {currentKeeper?.lastName}
              </p>
            </div>
            <Badge
              className={`${getStatusColor(assetData.bulkStatus)} px-2 py-1 rounded-full text-xs`}
            >
              {assetData.bulkStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="location">Location & Keeper</TabsTrigger>
            <TabsTrigger value="stock">Stock Details</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Asset Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Asset Name</Label>
                    <Input
                      value={assetData.name}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Asset name cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modelNumber">Model Number</Label>
                    <Input
                      id="modelNumber"
                      {...register("modelNumber")}
                      placeholder="Enter model number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    <Input
                      value={assetData.serialNumber || 'N/A'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Asset Type</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Badge className="bg-blue-100 text-blue-800">
                        {assetData.isBulk ? 'Bulk Asset' : 'Individual Asset'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Add any additional notes about this asset"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location & Keeper Tab */}
          <TabsContent value="location" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationId">Location *</Label>
                    <Select
                      value={watchedValues.locationId?.toString()}
                      onValueChange={(value) => setValue("locationId", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationsData?.data?.map((location: Location) => (
                          <SelectItem
                            key={location.locationId}
                            value={location.locationId.toString()}
                          >
                            <div>
                              <div className="font-medium">
                                {location.departmentName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {location.regionName}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentLocation && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Current Location</span>
                      </div>
                      <p className="text-sm">
                        {currentLocation.departmentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentLocation.regionName}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Keeper Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Keeper
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keeperPayrollNumber">Asset Keeper *</Label>
                    <Select
                      value={watchedValues.keeperPayrollNumber}
                      onValueChange={(value) => setValue("keeperPayrollNumber", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select keeper" />
                      </SelectTrigger>
                      <SelectContent>
                        {usersData?.data?.map((user: User) => (
                          <SelectItem
                            key={user.payrollNumber}
                            value={user.payrollNumber}
                          >
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.role} • {user.payrollNumber}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentKeeper && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Current Keeper</span>
                      </div>
                      <p className="text-sm">
                        {currentKeeper.firstName} {currentKeeper.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentKeeper.role} • {currentKeeper.payrollNumber}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stock Details Tab */}
          <TabsContent value="stock" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Current Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      {...register("quantity", { 
                        required: "Quantity is required",
                        valueAsNumber: true,
                        min: { value: 0, message: "Quantity must be 0 or greater" }
                      })}
                      placeholder="Enter quantity"
                      className={errors.quantity ? "border-red-500" : ""}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500">
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumThreshold">Minimum Threshold</Label>
                    <Input
                      id="minimumThreshold"
                      type="number"
                      min="0"
                      {...register("minimumThreshold", { 
                        valueAsNumber: true,
                        min: { value: 0, message: "Threshold must be 0 or greater" }
                      })}
                      placeholder="Enter minimum threshold"
                      className={errors.minimumThreshold ? "border-red-500" : ""}
                    />
                    {errors.minimumThreshold && (
                      <p className="text-sm text-red-500">
                        {errors.minimumThreshold.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Current Stock Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Current Level:</span>
                      <span className="ml-2 font-medium">{assetData.currentStockLevel}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Last Restocked:</span>
                      <span className="ml-2 font-medium">
                        {new Date(assetData.lastRestocked).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Changing the quantity will create a new inventory movement record. 
                    Make sure to document the reason for the change in the notes section.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || updateAssetMutation.isPending}
            className="bg-kr-maroon hover:bg-kr-maroon-dark"
          >
            {(isSubmitting || updateAssetMutation.isPending) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting || updateAssetMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}