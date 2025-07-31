"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    region: "Nairobi",
    location: "IT Store Room A",
    keeper: "Jane Smith",
    availability: "Available",
    is_bulk: true,
  },
  {
    id: "3",
    name: "Dell Latitude Laptop",
    serialNumber: "DELL-LAT-005",
    region: "Mombasa",
    location: "Office 203",
    keeper: "Peter Jones",
    availability: "Assigned",
    is_bulk: false,
  },
  {
    id: "4",
    name: "HDMI Cable (2m)",
    quantity: 120,
    region: "Kisumu",
    location: "Training Room",
    keeper: "Alice Brown",
    availability: "Available",
    is_bulk: true,
  },
  {
    id: "5",
    name: "Wireless Mouse (Logitech)",
    serialNumber: "MOUSE-LOG-010",
    region: "Nairobi",
    location: "Office 101",
    keeper: "John Doe",
    availability: "Available",
    is_bulk: false,
  },
]

export default function AssetListView() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS_INITIAL)
  const [isUniqueAssetFormOpen, setIsUniqueAssetFormOpen] = useState(false)
  const [isBulkAssetFormOpen, setIsBulkAssetFormOpen] = useState(false)

  const handleAddUniqueAsset = (data: UniqueAssetFormData) => {
    const newAsset: Asset = {
      id: (assets.length + 1).toString(),
      ...data,
      is_bulk: false,
    }
    setAssets((prev) => [...prev, newAsset])
    setIsUniqueAssetFormOpen(false)
  }

  const handleAddBulkAsset = (data: BulkAssetFormData) => {
    const newAsset: Asset = {
      id: (assets.length + 1).toString(),
      ...data,
      is_bulk: true,
    }
    setAssets((prev) => [...prev, newAsset])
    setIsBulkAssetFormOpen(false)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assets</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsUniqueAssetFormOpen(true)}>Add Unique Asset</Button>
          <Button onClick={() => setIsBulkAssetFormOpen(true)}>Add Bulk Asset</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Assets</CardTitle>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddUniqueAssetForm
        open={isUniqueAssetFormOpen}
        onOpenChange={setIsUniqueAssetFormOpen}
        onSuccess={handleAddUniqueAsset}
      />
      <AddBulkAssetForm
        open={isBulkAssetFormOpen}
        onOpenChange={setIsBulkAssetFormOpen}
        onSuccess={handleAddBulkAsset}
      />
    </>
  )
}
