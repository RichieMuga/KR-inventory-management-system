"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddUniqueAssetForm } from "@/components/add-unique-asset-form"
import { AddBulkAssetForm } from "@/components/add-bulk-asset-form"
import type { UniqueAssetFormData, BulkAssetFormData } from "@/lib/schemas"

interface Asset {
  id: string
  name: string
  serialNumber?: string
  quantity?: number
  region: string
  location: string
  keeper: string
  availability: string
  is_bulk: boolean
}

const MOCK_ASSETS_INITIAL: Asset[] = [
  {
    id: "1",
    name: "Projector (Epson)",
    serialNumber: "PROJ-EPS-001",
    region: "Nairobi",
    location: "Office 101",
    keeper: "John Doe",
    availability: "Available",
    is_bulk: false,
  },
  {
    id: "2",
    name: "HP Toner Cartridge (Black)",
    quantity: 50,
    region: "Mombasa",
    location: "IT Store Room A",
    keeper: "Jane Smith",
    availability: "Available",
    is_bulk: true,
  },
  {
    id: "3",
    name: "Dell Latitude Laptop",
    serialNumber: "DELL-LAT-005",
    region: "Kisumu",
    location: "Office 203",
    keeper: "Peter Jones",
    availability: "Assigned",
    is_bulk: false,
  },
  {
    id: "4",
    name: "HDMI Cable (2m)",
    quantity: 120,
    region: "Nairobi",
    location: "IT Store Room B",
    keeper: "Alice Brown",
    availability: "Available",
    is_bulk: true,
  },
  {
    id: "5",
    name: "Wireless Mouse (Logitech)",
    serialNumber: "LOGI-M-010",
    region: "Mombasa",
    location: "Office 101",
    keeper: "David Green",
    availability: "In Repair",
    is_bulk: false,
  },
]

export default function AssetListView() {
  const [showAddUniqueAssetForm, setShowAddUniqueAssetForm] = useState(false)
  const [showAddBulkAssetForm, setShowAddBulkAssetForm] = useState(false)
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS_INITIAL)

  const handleAddUniqueAssetSuccess = (data: UniqueAssetFormData) => {
    const newAsset: Asset = {
      id: (assets.length + 1).toString(),
      ...data,
      is_bulk: false,
    }
    setAssets((prevAssets) => [...prevAssets, newAsset])
    setShowAddUniqueAssetForm(false)
  }

  const handleAddBulkAssetSuccess = (data: BulkAssetFormData) => {
    const newAsset: Asset = {
      id: (assets.length + 1).toString(),
      ...data,
      is_bulk: true,
    }
    setAssets((prevAssets) => [...prevAssets, newAsset])
    setShowAddBulkAssetForm(false)
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assets</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddUniqueAssetForm(true)}>Add Unique Asset</Button>
          <Button onClick={() => setShowAddBulkAssetForm(true)}>Add Bulk Asset</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Asset Inventory</CardTitle>
          <CardDescription>A comprehensive list of all assets in your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serial Number / Quantity</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Keeper</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.is_bulk ? "Bulk" : "Unique"}</TableCell>
                  <TableCell>{asset.is_bulk ? asset.quantity : asset.serialNumber}</TableCell>
                  <TableCell>{asset.region}</TableCell>
                  <TableCell>{asset.location}</TableCell>
                  <TableCell>{asset.keeper}</TableCell>
                  <TableCell>{asset.availability}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddUniqueAssetForm
        open={showAddUniqueAssetForm}
        onOpenChange={setShowAddUniqueAssetForm}
        onSuccess={handleAddUniqueAssetSuccess}
      />
      <AddBulkAssetForm
        open={showAddBulkAssetForm}
        onOpenChange={setShowAddBulkAssetForm}
        onSuccess={handleAddBulkAssetSuccess}
      />
    </div>
  )
}
