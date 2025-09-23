"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  MapPin,
  User,
  History,
  FileText,
  Building,
  Tag,
  UserCheck,
  TrendingUp,
  Loader2,
  Shield,
  Calendar,
  Hash,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axiosInterceptor";
import { useEffect } from "react";

interface ViewUniqueAssetPageProps {
  assetId: string;
}

// API functions
const fetchUniqueAssetDetails = async (assetId: string) => {
  console.log("Fetching unique asset details for ID:", assetId);
  const response = await api.get(`/uniqueAssets/${assetId}`);
  console.log("Unique Asset API response:", response.data);
  return response.data;
};

const fetchLocation = async (locationId: number) => {
  console.log("Fetching location for ID:", locationId);
  const response = await api.get(`/locations/${locationId}`);
  console.log("Location API response:", response.data);
  return response.data.data;
};

const fetchKeeper = async (payrollNumber: string) => {
  console.log("Fetching keeper for payroll:", payrollNumber);
  const response = await api.get(`/users/${payrollNumber}`);
  console.log("Keeper API response:", response.data);
  return response.data.user;
};

const fetchMovements = async (assetId: string) => {
  console.log("Fetching movements for unique asset:", assetId);
  const response = await api.get(`/movement/${assetId}`);
  console.log("Movements API response:", response.data);
  return response.data;
};

const fetchAssignmentHistory = async (assetId: string) => {
  console.log("Fetching assignment history for unique asset:", assetId);
  const response = await api.get(`/unique-asset-tracking/${assetId}/history`);
  console.log("Assignment API response:", response.data);
  return response.data.data;
};

export function ViewUniqueAssetPage({ assetId }: ViewUniqueAssetPageProps) {
  console.log("ViewUniqueAssetPage rendering with assetId:", assetId);
  
  const handleGoBack = () => {
    console.log("Go back to asset list");
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };
  
  // Early return if no assetId
  if (!assetId) {
    console.error("ViewUniqueAssetPage: No assetId provided");
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">No Asset ID Provided</p>
            <p className="text-sm text-muted-foreground">
              Please ensure you're accessing this page with a valid asset ID
            </p>
            <Button onClick={handleGoBack} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage?.getItem("authToken");
    console.log("Auth token status:", token ? "PRESENT" : "MISSING");
  }, []);

  // Fetch asset details first
  const {
    data: assetData,
    isLoading: assetLoading,
    error: assetError,
  } = useQuery({
    queryKey: ["uniqueAsset", assetId],
    queryFn: () => fetchUniqueAssetDetails(assetId),
    enabled: !!assetId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log("Unique Asset query state:", {
    loading: assetLoading,
    error: !!assetError,
    hasData: !!assetData,
  });

  // Fetch location data based on asset's locationId
  const {
    data: locationData,
    isLoading: locationLoading,
  } = useQuery({
    queryKey: ["location", assetData?.locationId],
    queryFn: () => fetchLocation(assetData.locationId),
    enabled: !!assetData?.locationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch keeper data based on asset's keeperPayrollNumber
  const {
    data: keeperData,
    isLoading: keeperLoading,
  } = useQuery({
    queryKey: ["keeper", assetData?.keeperPayrollNumber],
    queryFn: () => fetchKeeper(assetData.keeperPayrollNumber),
    enabled: !!assetData?.keeperPayrollNumber,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch movements data
  const {
    data: movementsData,
    isLoading: movementsLoading,
  } = useQuery({
    queryKey: ["uniqueMovements", assetId],
    queryFn: () => fetchMovements(assetId),
    enabled: !!assetId && !!assetData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch assignment history
  const {
    data: assignmentData,
    isLoading: assignmentLoading,
  } = useQuery({
    queryKey: ["uniqueAssignments", assetId],
    queryFn: () => fetchAssignmentHistory(assetId),
    enabled: !!assetId && !!assetData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "in_use":
      case "active":
        return "bg-green-100 text-green-800";
      case "available":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-orange-100 text-orange-800";
      case "in_repair":
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "disposed":
      case "retired":
      case "discontinued":
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleEdit = () => {
    console.log("Edit unique asset:", assetId);
    // TODO: Navigate to edit page
  };

  // Loading state
  if (assetLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading asset details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (assetError) {
    console.error("Asset loading error:", assetError);
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading asset details</p>
            <p className="text-sm text-muted-foreground mb-4">
              {assetError instanceof Error ? assetError.message : "Unknown error occurred"}
            </p>
            <Button onClick={() => window?.location?.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!assetData) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p>No asset data found for ID: {assetId}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please check your authentication or try refreshing the page.
            </p>
            <Button onClick={() => window?.location?.reload()} className="mt-4">
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering unique asset page with data:", assetData);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-kr-maroon-dark" />
              <h1 className="text-2xl font-bold text-kr-maroon-dark">
                {assetData.name || "Unknown Asset"}
              </h1>
              <Badge variant="secondary" className="text-xs">
                Unique Asset
              </Badge>
            </div>
            <p className="text-muted-foreground">Asset ID: {assetData.assetId}</p>
          </div>
        </div>
        <Button
          onClick={handleEdit}
          className="bg-kr-maroon hover:bg-kr-maroon-dark"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Asset
        </Button>
      </div>

      {/* Asset Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Serial Number</p>
                <p className="font-medium">
                  {assetData.serialNumber || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                {locationLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    <span className="text-xs">Loading...</span>
                  </div>
                ) : locationData ? (
                  <>
                    <p className="font-medium">{locationData.departmentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {locationData.regionName}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Not available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Asset Keeper</p>
                {keeperLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    <span className="text-xs">Loading...</span>
                  </div>
                ) : keeperData ? (
                  <>
                    <p className="font-medium">
                      {keeperData.firstName} {keeperData.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{keeperData.role}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Unassigned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  className={`${getStatusColor(assetData.individualStatus)} px-2 py-1 rounded-full text-xs`}
                >
                  {formatStatus(assetData.individualStatus)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Asset Details</TabsTrigger>
          <TabsTrigger value="history">Assignment History</TabsTrigger>
          <TabsTrigger value="movements">Movement Log</TabsTrigger>
        </TabsList>

        {/* Asset Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Asset Name
                  </label>
                  <p className="text-base font-medium">{assetData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Asset ID
                  </label>
                  <p className="text-base font-mono">{assetData.assetId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Serial Number
                  </label>
                  <p className="text-base font-mono">{assetData.serialNumber || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Model Number
                  </label>
                  <p className="text-base">{assetData.modelNumber || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Asset Type
                  </label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-base font-medium text-blue-600">Unique Asset</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Current Status
                  </label>
                  <Badge
                    className={`${getStatusColor(assetData.individualStatus)} px-3 py-1 rounded-full text-sm font-medium`}
                  >
                    {formatStatus(assetData.individualStatus)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created At
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{formatDate(assetData.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{formatDate(assetData.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {assetData.notes && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Notes
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg mt-1">
                      <p className="text-base">{assetData.notes}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Location Information
                </h4>
                {locationLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading location...</span>
                  </div>
                ) : locationData ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Department
                        </label>
                        <p className="text-base font-medium">{locationData.departmentName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Region
                        </label>
                        <p className="text-base">{locationData.regionName}</p>
                      </div>
                      {locationData.notes && (
                        <div className="col-span-full">
                          <label className="text-sm font-medium text-muted-foreground">
                            Location Notes
                          </label>
                          <p className="text-base">{locationData.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Location information not available</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Asset Keeper Information
                </h4>
                {keeperLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading keeper...</span>
                  </div>
                ) : keeperData ? (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Full Name
                        </label>
                        <p className="text-base font-medium">
                          {keeperData.firstName} {keeperData.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Payroll Number
                        </label>
                        <p className="text-base font-mono">{keeperData.payrollNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Role/Position
                        </label>
                        <p className="text-base">{keeperData.role}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-muted-foreground">
                      This asset is currently unassigned to any keeper
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignment History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Assignment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading assignment history...</span>
                </div>
              ) : assignmentData && assignmentData.length > 0 ? (
                <div className="space-y-4">
                  {assignmentData.map((assignment: any, index: number) => (
                    <div key={assignment.id || index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Keeper</p>
                          <p className="font-medium">
                            {assignment.keeper?.firstName} {assignment.keeper?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.keeper?.payrollNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{assignment.location?.departmentName || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.location?.regionName || ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge
                            className={`${getStatusColor(assignment.status)} px-2 py-1 rounded-full text-xs`}
                          >
                            {formatStatus(assignment.status)}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">{formatDate(assignment.assignedAt)}</p>
                        </div>
                      </div>
                      {assignment.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-sm">{assignment.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No assignment history available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This asset hasn't been assigned to any keepers yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Movement History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading movement history...</span>
                </div>
              ) : movementsData && Array.isArray(movementsData) && movementsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From Location</TableHead>
                      <TableHead>To Location</TableHead>
                      <TableHead>Moved By</TableHead>
                      <TableHead>Movement Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementsData.map((movement: any) => (
                      <TableRow key={movement.movementId}>
                        <TableCell>
                          {movement.fromLocation?.departmentName || "N/A"}
                          <p className="text-xs text-muted-foreground">
                            {movement.fromLocation?.regionName || ""}
                          </p>
                        </TableCell>
                        <TableCell className="font-medium">
                          {movement.toLocation?.departmentName || "N/A"}
                          <p className="text-xs text-muted-foreground">
                            {movement.toLocation?.regionName || ""}
                          </p>
                        </TableCell>
                        <TableCell>
                          {movement.movedByUser ? 
                            `${movement.movedByUser.firstName} ${movement.movedByUser.lastName}` : 
                            movement.movedBy || "Unknown"
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {movement.movementType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{formatDate(movement.timestamp)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm truncate" title={movement.notes || "No notes"}>
                            {movement.notes || "No notes"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No movement history available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This asset hasn't been moved between locations yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}