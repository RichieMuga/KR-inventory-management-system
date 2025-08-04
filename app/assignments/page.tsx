"use client"

import { useState } from "react"
import { Eye, Trash2, Plus, MoreVertical, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Type definitions
interface Assignment {
  id: string
  assetName: string
  assetType: "bulk" | "unique"
  assetId: string | number
  assignedTo: string
  assignedBy: string
  dateIssued: string
  dateReturned: string | null
  conditionIssued: string
  conditionReturned: string | null
  status: "Outstanding" | "Returned"
  notes?: string
}

interface BulkAsset {
  id: number
  name: string
  status: "Issued" | "Not Issued"
  quantity: number
}

interface UniqueAsset {
  id: string
  name: string
  serialNumber: string
  status: "In Use" | "Not In Use"
}

// Union type for available assets
type AvailableAsset = BulkAsset | UniqueAsset

// Sample data
const initialAssignments: Assignment[] = [
  {
    id: "ASG-001",
    assetName: "Samsung TV Remote",
    assetType: "unique",
    assetId: "KR-REM-001",
    assignedTo: "Jane Smith",
    assignedBy: "John Doe",
    dateIssued: "2024-07-20",
    dateReturned: null,
    conditionIssued: "New",
    conditionReturned: null,
    status: "Outstanding",
    notes: "For conference room setup",
  },
  {
    id: "ASG-002",
    assetName: "USB Flash Drive (64GB)",
    assetType: "bulk",
    assetId: 4,
    assignedTo: "David Green",
    assignedBy: "Alice Brown",
    dateIssued: "2024-07-27",
    dateReturned: null,
    conditionIssued: "Good",
    conditionReturned: null,
    status: "Outstanding",
    notes: "For data transfer project",
  },
  {
    id: "ASG-003",
    assetName: "Projector (Epson)",
    assetType: "unique",
    assetId: "KR-PRJ-008",
    assignedTo: "Chris Wilson",
    assignedBy: "Michael Black",
    dateIssued: "2024-07-15",
    dateReturned: "2024-07-28",
    conditionIssued: "Good",
    conditionReturned: "Good",
    status: "Returned",
    notes: "Used for training session",
  },
  {
    id: "ASG-004",
    assetName: "24-Inch Dell Monitor",
    assetType: "unique",
    assetId: "KR-MON-003",
    assignedTo: "Emily Davis",
    assignedBy: "Sarah White",
    dateIssued: "2024-07-01",
    dateReturned: null,
    conditionIssued: "Good",
    conditionReturned: null,
    status: "Outstanding",
    notes: "Workstation upgrade",
  },
  {
    id: "ASG-005",
    assetName: "Wireless Mouse (Logitech)",
    assetType: "bulk",
    assetId: 5,
    assignedTo: "Olivia Taylor",
    assignedBy: "John Doe",
    dateIssued: "2024-06-25",
    dateReturned: null,
    conditionIssued: "Good",
    conditionReturned: null,
    status: "Outstanding",
    notes: "Replacement mouse",
  },
]

const availableBulkAssets: BulkAsset[] = [
  { id: 1, name: "HP Toner Cartridge (Black)", status: "Not Issued", quantity: 5 },
  { id: 2, name: "Network Cable (CAT6, 10m)", status: "Not Issued", quantity: 10 },
  { id: 6, name: "Ethernet Switch (24-port)", status: "Not Issued", quantity: 2 },
  { id: 8, name: "A4 Paper (Ream)", status: "Not Issued", quantity: 50 },
]

const availableUniqueAssets: UniqueAsset[] = [
  { id: "KR-PRT-002", name: "HP LaserJet Pro M404n", serialNumber: "HP404-2024-002", status: "Not In Use" },
  { id: "KR-LAP-007", name: "MacBook Pro 16-inch", serialNumber: "MBP16-2024-007", status: "Not In Use" },
  { id: "KR-SRV-006", name: "Dell PowerEdge R740", serialNumber: "DELL-R740-2024-006", status: "Not In Use" },
]

export default function AssetAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
  const [activeTab, setActiveTab] = useState("bulk")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [assignFormData, setAssignFormData] = useState<Partial<Assignment>>({})

  const getStatusBadge = (status: string) => {
    if (status === "Outstanding") {
      return (
        <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
          Outstanding
        </Badge>
      )
    } else {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Returned
        </Badge>
      )
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    if (activeTab === "bulk") return assignment.assetType === "bulk"
    if (activeTab === "unique") return assignment.assetType === "unique"
    return true
  })

  const handleView = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setViewDialogOpen(true)
  }

  const handleNewAssignment = () => {
    setAssignFormData({
      assetType: activeTab as "bulk" | "unique",
      dateIssued: new Date().toISOString().split("T")[0],
      status: "Outstanding",
      conditionIssued: "Good",
    })
    setAssignDialogOpen(true)
  }

  const handleSaveAssignment = () => {
    if (assignFormData.assetName && assignFormData.assignedTo && assignFormData.assignedBy) {
      const newAssignment: Assignment = {
        id: `ASG-${String(assignments.length + 1).padStart(3, "0")}`,
        assetName: assignFormData.assetName!,
        assetType: assignFormData.assetType as "bulk" | "unique",
        assetId: assignFormData.assetId!,
        assignedTo: assignFormData.assignedTo!,
        assignedBy: assignFormData.assignedBy!,
        dateIssued: assignFormData.dateIssued!,
        dateReturned: null,
        conditionIssued: assignFormData.conditionIssued!,
        conditionReturned: null,
        status: "Outstanding",
        notes: assignFormData.notes,
      }
      setAssignments((prev) => [...prev, newAssignment])
    }
    setAssignDialogOpen(false)
    setAssignFormData({})
  }

  const handleReturn = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setAssignFormData({
      ...assignment,
      dateReturned: new Date().toISOString().split("T")[0],
      conditionReturned: "Good",
    })
    setReturnDialogOpen(true)
  }

  const handleSaveReturn = () => {
    if (selectedAssignment && assignFormData.dateReturned && assignFormData.conditionReturned) {
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === selectedAssignment.id
            ? {
                ...assignment,
                dateReturned: assignFormData.dateReturned!,
                conditionReturned: assignFormData.conditionReturned!,
                status: "Returned" as const,
              }
            : assignment,
        ),
      )
    }
    setReturnDialogOpen(false)
    setAssignFormData({})
    setSelectedAssignment(null)
  }

  const handleDelete = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedAssignment) {
      setAssignments((prev) => prev.filter((assignment) => assignment.id !== selectedAssignment.id))
    }
    setDeleteDialogOpen(false)
    setSelectedAssignment(null)
  }

  // Fix the type issue by properly typing the return value and using type guards
  const getAvailableAssets = (): AvailableAsset[] => {
    if (assignFormData.assetType === "bulk") {
      return availableBulkAssets
    } else {
      return availableUniqueAssets
    }
  }

  // Helper function to check if an asset is a UniqueAsset
  const isUniqueAsset = (asset: AvailableAsset): asset is UniqueAsset => {
    return "serialNumber" in asset
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Assignments</h1>
          <p className="text-gray-600">Track asset assignments and verify responsibility</p>
        </div>
        <Button onClick={handleNewAssignment} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bulk" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
            Bulk Assets
          </TabsTrigger>
          <TabsTrigger value="unique" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
            Unique Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-red-900 hover:bg-red-900">
                  <TableHead className="text-white">Asset Name</TableHead>
                  <TableHead className="text-white">Assigned To</TableHead>
                  <TableHead className="text-white">Assigned By</TableHead>
                  <TableHead className="text-white">Date Issued</TableHead>
                  <TableHead className="text-white">Date Returned</TableHead>
                  <TableHead className="text-white">Condition Issued</TableHead>
                  <TableHead className="text-white">Condition Returned</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{assignment.assetName}</p>
                        {activeTab === "unique" && <p className="text-xs text-gray-500">ID: {assignment.assetId}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{assignment.assignedTo}</TableCell>
                    <TableCell>{assignment.assignedBy}</TableCell>
                    <TableCell>{assignment.dateIssued}</TableCell>
                    <TableCell className={assignment.dateReturned ? "text-green-600" : ""}>
                      {assignment.dateReturned || "N/A"}
                    </TableCell>
                    <TableCell>{assignment.conditionIssued}</TableCell>
                    <TableCell>{assignment.conditionReturned || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleView(assignment)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {assignment.status === "Outstanding" && (
                            <DropdownMenuItem onClick={() => handleReturn(assignment)}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Return Asset
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(assignment)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Assignment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{assignment.assetName}</h3>
                    {activeTab === "unique" && <p className="text-sm text-gray-600 mb-2">ID: {assignment.assetId}</p>}
                    <div className="flex items-center gap-2 mb-2">{getStatusBadge(assignment.status)}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(assignment)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {assignment.status === "Outstanding" && (
                        <DropdownMenuItem onClick={() => handleReturn(assignment)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Return Asset
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(assignment)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Assignment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned To:</span>
                    <span className="font-medium">{assignment.assignedTo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned By:</span>
                    <span className="font-medium">{assignment.assignedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Issued:</span>
                    <span className="font-medium">{assignment.dateIssued}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">{assignment.conditionIssued}</span>
                  </div>
                  {assignment.dateReturned && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Returned:</span>
                      <span className="font-medium text-green-600">{assignment.dateReturned}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Assignment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>View complete information for this asset assignment</DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Asset Name</Label>
                <p className="text-sm font-semibold">{selectedAssignment.assetName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Asset Type</Label>
                <p className="text-sm capitalize">{selectedAssignment.assetType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Assigned To</Label>
                <p className="text-sm">{selectedAssignment.assignedTo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Assigned By</Label>
                <p className="text-sm">{selectedAssignment.assignedBy}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Date Issued</Label>
                <p className="text-sm">{selectedAssignment.dateIssued}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Date Returned</Label>
                <p className="text-sm">{selectedAssignment.dateReturned || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedAssignment.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Condition Issued</Label>
                <p className="text-sm">{selectedAssignment.conditionIssued}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Condition Returned</Label>
                <p className="text-sm">{selectedAssignment.conditionReturned || "N/A"}</p>
              </div>
              {selectedAssignment.notes && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-sm mt-1">{selectedAssignment.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New {activeTab === "bulk" ? "Bulk" : "Unique"} Asset Assignment</DialogTitle>
            <DialogDescription>Assign a {activeTab} asset to a person and track responsibility</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="asset">Select {activeTab === "bulk" ? "Bulk" : "Unique"} Asset</Label>
              <Select
                value={assignFormData.assetName || ""}
                onValueChange={(value) => {
                  const assets = getAvailableAssets()
                  const asset = assets.find((a: AvailableAsset) => a.name === value)
                  setAssignFormData((prev) => ({
                    ...prev,
                    assetName: value,
                    assetId: asset?.id,
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${activeTab} asset`} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableAssets().map((asset: AvailableAsset) => (
                    <SelectItem key={asset.id} value={asset.name}>
                      {asset.name}
                      {isUniqueAsset(asset) && (
                        <span className="text-xs text-gray-500 ml-2">({asset.serialNumber})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={assignFormData.assignedTo || ""}
                onChange={(e) => setAssignFormData((prev) => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Enter person's name"
              />
            </div>
            <div>
              <Label htmlFor="assignedBy">Assigned By</Label>
              <Input
                id="assignedBy"
                value={assignFormData.assignedBy || ""}
                onChange={(e) => setAssignFormData((prev) => ({ ...prev, assignedBy: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="dateIssued">Date Issued</Label>
              <Input
                id="dateIssued"
                type="date"
                value={assignFormData.dateIssued || ""}
                onChange={(e) => setAssignFormData((prev) => ({ ...prev, dateIssued: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="conditionIssued">Condition Issued</Label>
              <Select
                value={assignFormData.conditionIssued || "Good"}
                onValueChange={(value) => setAssignFormData((prev) => ({ ...prev, conditionIssued: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={assignFormData.notes || ""}
                onChange={(e) => setAssignFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignment} className="bg-orange-500 hover:bg-orange-600">
              Create Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Asset Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
            <DialogDescription>Record the return of this asset and its condition</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dateReturned">Date Returned</Label>
              <Input
                id="dateReturned"
                type="date"
                value={assignFormData.dateReturned || ""}
                onChange={(e) => setAssignFormData((prev) => ({ ...prev, dateReturned: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="conditionReturned">Condition Returned</Label>
              <Select
                value={assignFormData.conditionReturned || "Good"}
                onValueChange={(value) => setAssignFormData((prev) => ({ ...prev, conditionReturned: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveReturn} className="bg-orange-500 hover:bg-orange-600">
              Return Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="py-4">
              <p className="text-sm">
                <strong>Asset:</strong> {selectedAssignment.assetName}
              </p>
              <p className="text-sm">
                <strong>Assigned To:</strong> {selectedAssignment.assignedTo}
              </p>
              <p className="text-sm">
                <strong>Date Issued:</strong> {selectedAssignment.dateIssued}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

