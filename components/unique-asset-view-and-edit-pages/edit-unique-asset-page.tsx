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
  Building,
  FileText,
  AlertCircle,
  Loader2,
  Shield,
  Hash,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api/axiosInterceptor";

interface EditUniqueAssetPageProps {
  assetId: string;
}

interface FormData {
  name: string;
  modelNumber: string;
  serialNumber: string;
  keeperPayrollNumber: string;
  locationId: number;
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

interface UniqueAsset {
  assetId: number;
  name: string;
  keeperPayrollNumber: string;
  locationId: number;
  serialNumber: string;
  isBulk: boolean;
  individualStatus: string;
  bulkStatus: string | null;
  currentStockLevel: number | null;
  minimumThreshold: number;
  lastRestocked: string | null;
  modelNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function EditUniqueAssetPage({ assetId }: EditUniqueAssetPageProps) {
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

  // Fetch current unique asset data
  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ['uniqueAsset', assetId],
    queryFn: async () => {
      const response = await api.get(`/uniqueAssets/${assetId}`);
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
        name: assetData.name || '',
        modelNumber: assetData.modelNumber || '',
        serialNumber: assetData.serialNumber || '',
        keeperPayrollNumber: assetData.keeperPayrollNumber || 'NONE',
        locationId: assetData.locationId || 0,
        notes: assetData.notes || ''
      });
    }
  }, [assetData, reset]);

  // Watch form values for real-time updates
  const watchedValues = watch();

  // Mutation for updating unique asset
  const updateAssetMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Convert 'NONE' back to empty string for the API
      const apiData = {
        ...data,
        keeperPayrollNumber: data.keeperPayrollNumber === 'NONE' ? '' : data.keeperPayrollNumber
      };
      const response = await api.patch(`/uniqueAssets/${assetId}`, apiData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch asset data
      queryClient.invalidateQueries({ queryKey: ['uniqueAsset', assetId] });
      // Show success message or redirect
      console.log('Unique asset updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating unique asset:', error);
    }
  });

  const onSubmit = (data: FormData) => {
    updateAssetMutation.mutate(data);
  };

  const handleCancel = () => {
    // Reset form to original values
    if (assetData) {
      reset({
        name: assetData.name || '',
        modelNumber: assetData.modelNumber || '',
        serialNumber: assetData.serialNumber || '',
        keeperPayrollNumber: assetData.keeperPayrollNumber || 'NONE',
        locationId: assetData.locationId || 0,
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
    (user: User) => user.payrollNumber === (watchedValues.keeperPayrollNumber === 'NONE' ? '' : watchedValues.keeperPayrollNumber)
  );
  const currentLocation = locationsData?.data?.find(
    (location: Location) => location.locationId === watchedValues.locationId
  );

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "in_use":
      case "active":
        return "bg-green-100 text-green-800";
      case "not_in_use":
      case "available":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-orange-100 text-orange-800";
      case "in_repair":
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "disposed":
      case "retired":
        return "bg-red-100 text-red-800";
      case "lost":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return "Unknown";
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
          <AlertDescription>Unique asset not found</AlertDescription>
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
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-kr-maroon-dark" />
              <h1 className="text-2xl font-bold text-kr-maroon-dark">
                Edit Unique Asset
              </h1>
              <Badge variant="secondary" className="text-xs">
                Unique Asset
              </Badge>
            </div>
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
            Unique asset updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {updateAssetMutation.isError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to update unique asset. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Status Preview */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">{watchedValues.name || assetData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentLocation?.departmentName || "No location"} • {
                    watchedValues.keeperPayrollNumber === 'NONE' || !currentKeeper 
                      ? "No keeper assigned" 
                      : `${currentKeeper.firstName} ${currentKeeper.lastName}`
                  }
                </p>
              </div>
            </div>
            <Badge
              className={`${getStatusColor(assetData.individualStatus)} px-2 py-1 rounded-full text-xs`}
            >
              {formatStatus(assetData.individualStatus)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Asset Information</TabsTrigger>
            <TabsTrigger value="assignment">Location & Assignment</TabsTrigger>
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
                    <Label htmlFor="name">Asset Name *</Label>
                    <Input
                      id="name"
                      {...register("name", { 
                        required: "Asset name is required",
                        minLength: { value: 2, message: "Asset name must be at least 2 characters" }
                      })}
                      placeholder="Enter asset name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
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
                    <Label htmlFor="serialNumber">Serial Number *</Label>
                    <Input
                      id="serialNumber"
                      {...register("serialNumber", { 
                        required: "Serial number is required",
                        minLength: { value: 1, message: "Serial number is required" }
                      })}
                      placeholder="Enter serial number"
                      className={errors.serialNumber ? "border-red-500" : ""}
                    />
                    {errors.serialNumber && (
                      <p className="text-sm text-red-500">
                        {errors.serialNumber.message}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      <span>Unique identifier for this specific asset</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Asset Type</Label>
                    <div className="p-3 bg-blue-50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <Badge className="bg-blue-100 text-blue-800">
                          Unique Asset
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This is an individual, trackable asset with its own serial number
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes & Description</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Add any additional notes, description, or specifications about this asset"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include details like condition, specifications, or special handling instructions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location & Assignment Tab */}
          <TabsContent value="assignment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Asset Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationId">Current Location *</Label>
                    <Select
                      value={watchedValues.locationId?.toString()}
                      onValueChange={(value) => setValue("locationId", parseInt(value))}
                    >
                      <SelectTrigger className={errors.locationId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select asset location" />
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
                    {!watchedValues.locationId && (
                      <p className="text-sm text-red-500">Location is required</p>
                    )}
                  </div>

                  {currentLocation && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Selected Location</span>
                      </div>
                      <p className="text-sm font-medium">
                        {currentLocation.departmentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Region: {currentLocation.regionName}
                      </p>
                      {currentLocation.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {currentLocation.notes}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Keeper Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Asset Keeper
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keeperPayrollNumber">Assigned Keeper</Label>
                    <Select
                      value={watchedValues.keeperPayrollNumber}
                      onValueChange={(value) => setValue("keeperPayrollNumber", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset keeper (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">
                          <div className="text-muted-foreground">No keeper assigned</div>
                        </SelectItem>
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
                    <p className="text-xs text-muted-foreground">
                      The person responsible for this asset (optional)
                    </p>
                  </div>

                  {currentKeeper && watchedValues.keeperPayrollNumber !== 'NONE' ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-900">Current Keeper</span>
                      </div>
                      <p className="text-sm font-medium">
                        {currentKeeper.firstName} {currentKeeper.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentKeeper.role} • {currentKeeper.payrollNumber}
                      </p>
                      {currentKeeper.defaultLocation && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Default Location: {currentKeeper.defaultLocation.departmentName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">No Keeper Assigned</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This asset is currently unassigned to any specific keeper
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Changes to location or keeper assignment will be tracked in the asset's movement history. 
                Make sure to document any reasons for changes in the notes section.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel Changes
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