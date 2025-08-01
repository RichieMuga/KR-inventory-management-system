"use client";

import type React from "react";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditAssetPageProps {
  assetId: string;
}

// Mock data for dropdowns
const mockLocations = [
  {
    locationId: "LOC-001",
    departmentName: "IT Store Room A",
    regionName: "Nairobi Central",
  },
  {
    locationId: "LOC-002",
    departmentName: "IT Store Room B",
    regionName: "Nairobi Central",
  },
  {
    locationId: "LOC-003",
    departmentName: "Conference Room 1",
    regionName: "Mombasa North",
  },
  {
    locationId: "LOC-004",
    departmentName: "Server Room 1",
    regionName: "Kisumu East",
  },
  {
    locationId: "LOC-005",
    departmentName: "Main Warehouse",
    regionName: "Nairobi Central",
  },
];

const mockKeepers = [
  {
    payrollNumber: "EMP-001",
    firstname: "John",
    lastname: "Doe",
    role: "IT Administrator",
  },
  {
    payrollNumber: "EMP-002",
    firstname: "Jane",
    lastname: "Smith",
    role: "IT Support",
  },
  {
    payrollNumber: "EMP-003",
    firstname: "Peter",
    lastname: "Jones",
    role: "Store Manager",
  },
  {
    payrollNumber: "EMP-004",
    firstname: "Alice",
    lastname: "Brown",
    role: "IT Technician",
  },
  {
    payrollNumber: "EMP-005",
    firstname: "David",
    lastname: "Green",
    role: "System Administrator",
  },
];

const availabilityOptions = [
  { value: "Available", label: "Available" },
  { value: "Assigned", label: "Assigned" },
  { value: "In Repair", label: "In Repair" },
  { value: "Disposed", label: "Disposed" },
];

const regionOptions = [
  { value: "Nairobi", label: "Nairobi" },
  { value: "Mombasa", label: "Mombasa" },
  { value: "Kisumu", label: "Kisumu" },
  { value: "Nakuru", label: "Nakuru" },
  { value: "Eldoret", label: "Eldoret" },
];

export function EditAssetPage({ assetId }: EditAssetPageProps) {
  // Form state - pre-filled with existing data
  const [formData, setFormData] = useState({
    assetId: "AST-001",
    name: "HP Toner Cartridge (Black)",
    serialNumber: "HP-TNR-BLK-001",
    region: "Nairobi",
    keeperPayrollNumber: "EMP-001",
    availability: "Available",
    locationId: "LOC-001",
    isBulk: true,
    quantity: 25,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get current keeper and location details
  const currentKeeper = mockKeepers.find(
    (k) => k.payrollNumber === formData.keeperPayrollNumber,
  );
  const currentLocation = mockLocations.find(
    (l) => l.locationId === formData.locationId,
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Asset name is required";
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Serial number is required";
    }

    if (!formData.region) {
      newErrors.region = "Region is required";
    }

    if (!formData.keeperPayrollNumber) {
      newErrors.keeperPayrollNumber = "Keeper is required";
    }

    if (!formData.availability) {
      newErrors.availability = "Availability status is required";
    }

    if (!formData.locationId) {
      newErrors.locationId = "Location is required";
    }

    if (formData.isBulk && (!formData.quantity || formData.quantity <= 0)) {
      newErrors.quantity = "Quantity must be greater than 0 for bulk assets";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Updated asset data:", formData);
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating asset:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log("Cancel edit");
    // TODO: Navigate back or show confirmation dialog
  };

  const handleGoBack = () => {
    console.log("Go back to asset view");
    // TODO: Navigate back to asset view page
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Assigned":
        return "bg-orange-100 text-orange-800";
      case "In Repair":
        return "bg-yellow-100 text-yellow-800";
      case "Disposed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
              Asset ID: {formData.assetId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-kr-maroon hover:bg-kr-maroon-dark"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Asset updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Current Status Preview */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{formData.name}</h3>
              <p className="text-sm text-muted-foreground">
                {currentLocation?.departmentName} • {currentKeeper?.firstname}{" "}
                {currentKeeper?.lastname}
              </p>
            </div>
            <Badge
              className={`${getAvailabilityColor(formData.availability)} px-2 py-1 rounded-full text-xs`}
            >
              {formData.availability}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="location">Location & Keeper</TabsTrigger>
            {formData.isBulk && (
              <TabsTrigger value="stock">Stock Details</TabsTrigger>
            )}
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
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="Enter asset name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number *</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) =>
                        updateFormData("serialNumber", e.target.value)
                      }
                      placeholder="Enter serial number"
                      className={errors.serialNumber ? "border-red-500" : ""}
                    />
                    {errors.serialNumber && (
                      <p className="text-sm text-red-500">
                        {errors.serialNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => updateFormData("region", value)}
                    >
                      <SelectTrigger
                        className={errors.region ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regionOptions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.region && (
                      <p className="text-sm text-red-500">{errors.region}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability Status *</Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(value) =>
                        updateFormData("availability", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.availability ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.availability && (
                      <p className="text-sm text-red-500">
                        {errors.availability}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isBulk"
                    checked={formData.isBulk}
                    onCheckedChange={(checked) =>
                      updateFormData("isBulk", checked)
                    }
                  />
                  <Label htmlFor="isBulk" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    This is a bulk asset (has quantity)
                  </Label>
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
                    <Label htmlFor="location">Location *</Label>
                    <Select
                      value={formData.locationId}
                      onValueChange={(value) =>
                        updateFormData("locationId", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.locationId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockLocations.map((location) => (
                          <SelectItem
                            key={location.locationId}
                            value={location.locationId}
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
                    {errors.locationId && (
                      <p className="text-sm text-red-500">
                        {errors.locationId}
                      </p>
                    )}
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
                    <Label htmlFor="keeper">Asset Keeper *</Label>
                    <Select
                      value={formData.keeperPayrollNumber}
                      onValueChange={(value) =>
                        updateFormData("keeperPayrollNumber", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.keeperPayrollNumber ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select keeper" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockKeepers.map((keeper) => (
                          <SelectItem
                            key={keeper.payrollNumber}
                            value={keeper.payrollNumber}
                          >
                            <div>
                              <div className="font-medium">
                                {keeper.firstname} {keeper.lastname}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {keeper.role} • {keeper.payrollNumber}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.keeperPayrollNumber && (
                      <p className="text-sm text-red-500">
                        {errors.keeperPayrollNumber}
                      </p>
                    )}
                  </div>

                  {currentKeeper && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Current Keeper</span>
                      </div>
                      <p className="text-sm">
                        {currentKeeper.firstname} {currentKeeper.lastname}
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

          {/* Stock Details Tab (only for bulk assets) */}
          {formData.isBulk && (
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
                        value={formData.quantity}
                        onChange={(e) =>
                          updateFormData(
                            "quantity",
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="Enter quantity"
                        className={errors.quantity ? "border-red-500" : ""}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-red-500">
                          {errors.quantity}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Asset Type</Label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <Badge className="bg-blue-100 text-blue-800">
                          Bulk Asset
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          This asset is tracked by quantity
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Changing the quantity will create a new inventory movement
                      record. Make sure to document the reason for the change.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-kr-maroon hover:bg-kr-maroon-dark"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
