"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { AssetListView } from "@/components/asset-list-view"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CreateAssetForm } from "@/components/create-asset-form"
import { PlusCircle } from "lucide-react"

interface Asset {
  id: string
  name: string
  serialNumber?: string // Make optional for bulk items
  region: string
  availability: "Available" | "Assigned" | "In Repair" | "Disposed"
  location: string
  keeper: string
  isBulk: boolean
  quantity?: number
}

const MOCK_ASSETS_INITIAL: Asset[] = [
  {
    id: "1",
    name: "HP Toner Cartridge (Black)",
    serialNumber: undefined, // No serial for bulk
    region: "Nairobi",
    availability: "Available",
    location: "IT Store Room A",
    keeper: "John Doe",
    isBulk: true,
    quantity: 25,
  },
  {
    id: "2",
    name: "Samsung TV Remote",
    serialNumber: "SAMS-REM-TV-002",
    region: "Mombasa",
    availability: "Assigned",
    location: "Conference Room 3",
    keeper: "Jane Smith",
    isBulk: false,
  },
  {
    id: "3",
    name: "Epson Ink Cartridge (Cyan)",
    serialNumber: undefined,
    region: "Kisumu",
    availability: "Available",
    location: "IT Store Room B",
    keeper: "Peter Jones",
    isBulk: true,
    quantity: 15,
  },
  {
    id: "4",
    name: "Network Cable (CAT6, 10m)",
    serialNumber: undefined,
    region: "Nairobi",
    availability: "Available",
    location: "Server Room 1",
    keeper: "Alice Brown",
    isBulk: true,
    quantity: 50,
  },
  {
    id: "5",
    name: "USB Flash Drive (64GB)",
    serialNumber: "USB-FLSH-64GB-005",
    region: "Mombasa",
    availability: "Assigned",
    location: "User Desk 101",
    keeper: "David Green",
    isBulk: false,
  },
  {
    id: "6",
    name: "Wireless Mouse (Logitech)",
    serialNumber: undefined,
    region: "Kisumu",
    availability: "Available",
    location: "IT Store Room A",
    keeper: "Sarah White",
    isBulk: true,
    quantity: 10,
  },
  {
    id: "7",
    name: "Standard Keyboard",
    serialNumber: undefined,
    region: "Nairobi",
    availability: "Available",
    location: "IT Store Room B",
    keeper: "Michael Black",
    isBulk: true,
    quantity: 20,
  },
  {
    id: "8",
    name: "24-inch Dell Monitor",
    serialNumber: "MON-DELL-24-008",
    region: "Mombasa",
    availability: "In Repair",
    location: "Repair Workshop",
    keeper: "Emily Davis",
    isBulk: false,
  },
  {
    id: "9",
    name: "Projector (Epson)",
    serialNumber: "PROJ-EPS-009",
    region: "Kisumu",
    availability: "Assigned",
    location: "Training Room",
    keeper: "Chris Wilson",
    isBulk: false,
  },
  {
    id: "10",
    name: "Server Rack Unit (42U)",
    serialNumber: "SRV-RACK-42U-010",
    region: "Nairobi",
    availability: "Available",
    location: "Server Room 2",
    keeper: "Olivia Taylor",
    isBulk: false,
  },
]

export default function HomePage() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS_INITIAL)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleAddAsset = (newAsset: Asset) => {
    setAssets((prevAssets) => [...prevAssets, newAsset])
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex justify-end">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-kr-orange hover:bg-kr-orange-dark">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Asset
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Create New Asset</SheetTitle>
              </SheetHeader>
              <CreateAssetForm onAddAsset={handleAddAsset} onClose={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
        <AssetListView assets={assets} />
      </main>
    </div>
  )
}
