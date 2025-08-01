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
} from "lucide-react";

interface ViewAssetPageProps {
  assetId: string;
}

// Mock data based on your ERD structure
const mockAssetData = {
  // Asset table data
  asset: {
    assetId: "AST-001",
    name: "HP Toner Cartridge (Black)",
    region: "Nairobi",
    keeperPayrollNumber: "EMP-001",
    availability: "Available" as const,
    serialNumber: "HP-TNR-BLK-001",
    locationId: "LOC-001",
    isBulk: true,
  },
  // User table data (Keeper)
  keeper: {
    payrollNumber: "EMP-001",
    firstname: "John",
    lastname: "Doe",
    role: "IT Administrator",
  },
  // Location table data
  location: {
    locationId: "LOC-001",
    regionName: "Nairobi Central",
    departmentName: "IT Store Room A",
  },
  // Asset stock data (for bulk items)
  stock: {
    assetId: "AST-001",
    quantity: 25,
    assetName: "HP Toner Cartridge (Black)",
    keeper: "John Doe",
  },
  // Inventory movement history
  movements: [
    {
      movementId: "MOV-001",
      assetId: "AST-001",
      fromLocation: "IT Store Room B",
      toLocation: "IT Store Room A",
      movedBy: "Jane Smith",
      timestamp: "2024-01-15T10:30:00Z",
      notes: "Relocated for better organization",
      quantity: 25,
    },
    {
      movementId: "MOV-002",
      assetId: "AST-001",
      fromLocation: "Main Warehouse",
      toLocation: "IT Store Room B",
      movedBy: "Peter Jones",
      timestamp: "2024-01-10T14:20:00Z",
      notes: "Initial stock placement",
      quantity: 25,
    },
  ],
  // Asset assignment history
  assignments: [
    {
      assignmentId: "ASSIGN-001",
      assetId: "AST-001",
      assignedTo: "Alice Brown",
      assignedBy: "John Doe",
      dateIssued: "2024-01-20T09:00:00Z",
      dateDue: "2024-02-20T17:00:00Z",
      dateReturned: "2024-01-25T16:30:00Z",
      conditionIssued: "New",
      conditionReturned: "Good",
      notes: "Used for printer maintenance",
    },
    {
      assignmentId: "ASSIGN-002",
      assetId: "AST-001",
      assignedTo: "David Green",
      assignedBy: "John Doe",
      dateIssued: "2024-01-12T11:00:00Z",
      dateDue: "2024-01-19T17:00:00Z",
      dateReturned: "2024-01-18T15:45:00Z",
      conditionIssued: "New",
      conditionReturned: "Good",
      notes: "Emergency printer repair",
    },
  ],
};

export function ViewAssetPage({ assetId }: ViewAssetPageProps) {
  const { asset, keeper, location, stock, movements, assignments } =
    mockAssetData;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = () => {
    console.log("Edit asset:", assetId);
    // TODO: Navigate to edit page or open edit modal
  };

  const handleGoBack = () => {
    console.log("Go back to asset list");
    // TODO: Navigate back to asset list
  };

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
              {asset.name}
            </h1>
            <p className="text-muted-foreground">Asset ID: {asset.assetId}</p>
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
                <p className="font-medium">{asset.serialNumber}</p>
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
                <p className="font-medium">{location.departmentName}</p>
                <p className="text-xs text-muted-foreground">
                  {location.regionName}
                </p>
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
                <p className="font-medium">
                  {keeper.firstname} {keeper.lastname}
                </p>
                <p className="text-xs text-muted-foreground">{keeper.role}</p>
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
                  className={`${getAvailabilityColor(asset.availability)} px-2 py-1 rounded-full text-xs`}
                >
                  {asset.availability}
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
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          {asset.isBulk && <TabsTrigger value="stock">Stock</TabsTrigger>}
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
                  <p className="text-base">{asset.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Asset ID
                  </label>
                  <p className="text-base">{asset.assetId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Serial Number
                  </label>
                  <p className="text-base">{asset.serialNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Region
                  </label>
                  <p className="text-base">{asset.region}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Asset Type
                  </label>
                  <p className="text-base">
                    {asset.isBulk ? "Bulk Asset" : "Unique Asset"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Availability
                  </label>
                  <Badge
                    className={`${getAvailabilityColor(asset.availability)} px-2 py-1 rounded-full text-xs`}
                  >
                    {asset.availability}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Location Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Department
                    </label>
                    <p className="text-base">{location.departmentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Region
                    </label>
                    <p className="text-base">{location.regionName}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Keeper Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-base">
                      {keeper.firstname} {keeper.lastname}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Payroll Number
                    </label>
                    <p className="text-base">{keeper.payrollNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Role
                    </label>
                    <p className="text-base">{keeper.role}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Assignment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead>Date Issued</TableHead>
                    <TableHead>Date Due</TableHead>
                    <TableHead>Date Returned</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.assignmentId}>
                      <TableCell className="font-medium">
                        {assignment.assignedTo}
                      </TableCell>
                      <TableCell>{assignment.assignedBy}</TableCell>
                      <TableCell>{formatDate(assignment.dateIssued)}</TableCell>
                      <TableCell>{formatDate(assignment.dateDue)}</TableCell>
                      <TableCell>
                        {assignment.dateReturned
                          ? formatDate(assignment.dateReturned)
                          : "Not returned"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              Issued:
                            </span>{" "}
                            {assignment.conditionIssued}
                          </div>
                          {assignment.conditionReturned && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                Returned:
                              </span>{" "}
                              {assignment.conditionReturned}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {assignment.notes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From Location</TableHead>
                    <TableHead>To Location</TableHead>
                    <TableHead>Moved By</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.movementId}>
                      <TableCell>{movement.fromLocation}</TableCell>
                      <TableCell className="font-medium">
                        {movement.toLocation}
                      </TableCell>
                      <TableCell>{movement.movedBy}</TableCell>
                      <TableCell>{formatDate(movement.timestamp)}</TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {movement.notes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Tab (only for bulk assets) */}
        {asset.isBulk && (
          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-kr-maroon-dark">
                      {stock.quantity}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current Stock
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Asset Name
                    </label>
                    <p className="text-base">{stock.assetName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Stock Keeper
                    </label>
                    <p className="text-base">{stock.keeper}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h4 className="font-medium mb-4">Stock Movement Summary</h4>
                  <div className="space-y-2">
                    {movements.map((movement, index) => (
                      <div
                        key={movement.movementId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {movement.fromLocation} → {movement.toLocation}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(movement.timestamp)} by{" "}
                              {movement.movedBy}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {movement.quantity} units
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
