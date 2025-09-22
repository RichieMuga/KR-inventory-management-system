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
  Package,
  History,
  FileText,
  Building,
  Tag,
  Clock,
  UserCheck,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axiosInterceptor";
import { useEffect } from "react";

interface ViewAssetPageProps {
  assetId: string;
}

// API functions
const fetchAssetDetails = async (assetId: string) => {
  console.log("Fetching asset details for ID:", assetId);
  const response = await api.get(`/view-bulk-asset/${assetId}`);
  console.log("Asset API response:", response.data);
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
  console.log("Fetching movements for asset:", assetId);
  const response = await api.get(`/movement/${assetId}`);
  console.log("Movements API response:", response.data);
  return response.data;
};

const fetchStockLevels = async (assetId: string) => {
  console.log("Fetching stock levels for asset:", assetId);
  const response = await api.get(`/stock-levels/${assetId}`);
  console.log("Stock API response:", response.data);
  return response.data;
};

const fetchAssignmentHistory = async (assetId: string) => {
  console.log("Fetching assignment history for asset:", assetId);
  const response = await api.get(`/bulk-asset-tracking/${assetId}/history`);
  console.log("Assignment API response:", response.data);
  return response.data.data;
};

export function ViewAssetPage({ assetId }: ViewAssetPageProps) {
  console.log("ViewAssetPage rendering with assetId:", assetId);
  
  const handleGoBack = () => {
    console.log("Go back to asset list");
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };
  
  // Early return if no assetId
  if (!assetId) {
    console.error("ViewAssetPage: No assetId provided");
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
    queryKey: ["asset", assetId],
    queryFn: () => fetchAssetDetails(assetId),
    enabled: !!assetId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log("Asset query state:", {
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
    queryKey: ["movements", assetId],
    queryFn: () => fetchMovements(assetId),
    enabled: !!assetId && !!assetData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch stock levels data (for bulk assets)
  const {
    data: stockData,
    isLoading: stockLoading,
  } = useQuery({
    queryKey: ["stock", assetId],
    queryFn: () => fetchStockLevels(assetId),
    enabled: !!assetId && !!assetData?.isBulk,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch assignment history
  const {
    data: assignmentData,
    isLoading: assignmentLoading,
  } = useQuery({
    queryKey: ["assignments", assetId],
    queryFn: () => fetchAssignmentHistory(assetId),
    enabled: !!assetId && !!assetData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getAvailabilityColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "assigned":
        return "bg-orange-100 text-orange-800";
      case "in repair":
        return "bg-yellow-100 text-yellow-800";
      case "disposed":
      case "discontinued":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    console.log("Edit asset:", assetId);
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

  console.log("Rendering asset page with data:", assetData);
  
  // Determine display status
  const displayStatus = assetData.isBulk ? assetData.bulkStatus : assetData.individualStatus;

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
            <h1 className="text-2xl font-bold text-kr-maroon-dark">
              {assetData.name || "Unknown Asset"}
            </h1>
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
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Serial Number</p>
                <p className="font-medium">
                  {assetData.serialNumber || "N/A (Bulk Asset)"}
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
                <p className="text-sm text-muted-foreground">Keeper</p>
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
                  <p className="text-muted-foreground text-sm">Not available</p>
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
                  className={`${getAvailabilityColor(displayStatus)} px-2 py-1 rounded-full text-xs`}
                >
                  {displayStatus || "Unknown"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="assignments">History</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          {assetData.isBulk && <TabsTrigger value="stock">Stock</TabsTrigger>}
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
                  <p className="text-base">{assetData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Asset ID
                  </label>
                  <p className="text-base">{assetData.assetId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Serial Number
                  </label>
                  <p className="text-base">{assetData.serialNumber || "N/A"}</p>
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
                  <p className="text-base">
                    {assetData.isBulk ? "Bulk Asset" : "Unique Asset"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <Badge
                    className={`${getAvailabilityColor(displayStatus)} px-2 py-1 rounded-full text-xs`}
                  >
                    {displayStatus || "Unknown"}
                  </Badge>
                </div>
                {assetData.isBulk && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Current Stock Level
                      </label>
                      <p className="text-base">{assetData.currentStockLevel || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Minimum Threshold
                      </label>
                      <p className="text-base">{assetData.minimumThreshold || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Restocked
                      </label>
                      <p className="text-base">{formatDate(assetData.lastRestocked)}</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created At
                  </label>
                  <p className="text-base">{formatDate(assetData.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Updated At
                  </label>
                  <p className="text-base">{formatDate(assetData.updatedAt)}</p>
                </div>
              </div>

              {assetData.notes && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Notes
                    </label>
                    <p className="text-base">{assetData.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Location Details
                </h4>
                {locationLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading location...</span>
                  </div>
                ) : locationData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Department
                      </label>
                      <p className="text-base">{locationData.departmentName}</p>
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
                ) : (
                  <p className="text-muted-foreground">Location information not available</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Keeper Information
                </h4>
                {keeperLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading keeper...</span>
                  </div>
                ) : keeperData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Name
                      </label>
                      <p className="text-base">
                        {keeperData.firstName} {keeperData.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Payroll Number
                      </label>
                      <p className="text-base">{keeperData.payrollNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Role
                      </label>
                      <p className="text-base">{keeperData.role}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Keeper information not available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignment History Tab */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Asset History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading history...</span>
                </div>
              ) : assignmentData?.assets && assignmentData.assets.length > 0 ? (
                <div className="space-y-4">
                  {assignmentData.assets.map((asset: any) => (
                    <div key={asset.assetId} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Asset ID: {asset.assetId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Keeper</p>
                          <p className="font-medium">{asset.keeper?.fullName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{asset.location?.departmentName || "N/A"}</p>
                        </div>
                      </div>
                      {asset.isBulk && asset.stockMetrics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                          <div>
                            <p className="text-muted-foreground">Stock Level</p>
                            <p className="font-medium">{asset.currentStockLevel || 0}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stock Status</p>
                            <Badge 
                              variant={asset.stockMetrics.isLowStock ? "destructive" : "default"}
                              className="text-xs"
                            >
                              {asset.stockMetrics.isLowStock ? "Low Stock" : "Normal"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Restocked</p>
                            <p className="font-medium">
                              {formatDate(asset.lastRestocked)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stock %</p>
                            <p className="font-medium">{asset.stockMetrics.stockPercentage || 0}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No history data available
                </p>
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
                  <span>Loading movements...</span>
                </div>
              ) : movementsData && Array.isArray(movementsData) && movementsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From Location</TableHead>
                      <TableHead>To Location</TableHead>
                      <TableHead>Moved By</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementsData.map((movement: any) => (
                      <TableRow key={movement.movementId}>
                        <TableCell>
                          {movement.fromLocation?.departmentName || "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {movement.toLocation?.departmentName || "N/A"}
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
                        <TableCell>{formatDate(movement.timestamp)}</TableCell>
                        <TableCell>{movement.quantity || 0}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {movement.notes || "No notes"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No movement history available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Tab (only for bulk assets) */}
        {assetData.isBulk && (
          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stockLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading stock data...</span>
                  </div>
                ) : stockData ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-kr-maroon-dark">
                          {stockData.currentStockLevel || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Current Stock
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {stockData.minimumThreshold || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Minimum Threshold
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stockData.totalMovements || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total Movements
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stockData.totalRestocked || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total Restocked
                        </p>
                      </div>
                    </div>

                    {stockData.isLowStock && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 font-medium">
                          Low Stock Alert: Current stock is below minimum threshold
                        </p>
                      </div>
                    )}

                    <Separator className="my-6" />

                    <div>
                      <h4 className="font-medium mb-4">Recent Movements</h4>
                      {stockData.recentMovements && stockData.recentMovements.length > 0 ? (
                        <div className="space-y-2">
                          {stockData.recentMovements.map((movement: any, index: number) => (
                            <div
                              key={movement.movementId || index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {movement.movementType} - {movement.quantity || 0} units
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(movement.timestamp)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="secondary" className="text-xs">
                                  {movement.movementType}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No recent movements</p>
                      )}
                    </div>

                    {stockData.recentRestocks && stockData.recentRestocks.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h4 className="font-medium mb-4">Recent Restocks</h4>
                          <div className="space-y-2">
                            {stockData.recentRestocks.map((restock: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Package className="h-4 w-4 text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      Restocked: {restock.quantity || 0} units
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(restock.timestamp)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Stock information not available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}