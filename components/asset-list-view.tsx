"use client"

import type React from "react"

import { useState, useMemo, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AssetCard } from "./asset-card"
import { AssetTable } from "./asset-table"
import { Search, PlusCircle, PackagePlus } from "lucide-react" // Import new icons
import { AddUniqueAssetForm, type UniqueAssetFormData } from "./add-unique-asset-form" // Import new form
import { AddBulkAssetForm, type BulkAssetFormData } from "./add-bulk-asset-form" // Import new form

interface Asset {
  id: string
  name: string
  serialNumber: string
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
    serialNumber: "HP-TNR-BLK-001",
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
    serialNumber: "EPS-INK-CYN-003",
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
    serialNumber: "NET-CAB-CAT6-004",
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
    serialNumber: "WL-MSE-LOGI-006",
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
    serialNumber: "STD-KEY-007",
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

export function AssetListView() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS_INITIAL) // Change to useState
  const [searchTerm, setSearchTerm] = useState("")
  const [displaySearchTerm, setDisplaySearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [showUniqueAssetModal, setShowUniqueAssetModal] = useState(false)
  const [showBulkAssetModal, setShowBulkAssetModal] = useState(false)

  const suggestions = useMemo(() => {
    if (!displaySearchTerm) return []
    const lowerCaseSearchTerm = displaySearchTerm.toLowerCase()
    return assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.serialNumber.toLowerCase().includes(lowerCaseSearchTerm),
    )
  }, [displaySearchTerm, assets])

  const filteredAssets = useMemo(() => {
    if (!searchTerm) {
      return assets
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.serialNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.location.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.region.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.keeper.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.availability.toLowerCase().includes(lowerCaseSearchTerm),
    )
  }, [searchTerm, assets])

  const handleAddUniqueAsset = (data: UniqueAssetFormData) => {
    console.log("Adding unique asset:", data)
    const newAsset: Asset = {
      ...data,
      id: (assets.length + 1).toString(), // Simple ID generation
      isBulk: false,
    }
    setAssets((prevAssets) => [...prevAssets, newAsset])
    setShowUniqueAssetModal(false)
  }

  const handleAddBulkAsset = (data: BulkAssetFormData) => {
    console.log("Adding bulk asset:", data)
    const newAsset: Asset = {
      ...data,
      id: (assets.length + 1).toString(), // Simple ID generation
      isBulk: true,
    }
    setAssets((prevAssets) => [...prevAssets, newAsset])
    setShowBulkAssetModal(false)
  }

  const handleSearch = () => {
    setSearchTerm(displaySearchTerm)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: Asset) => {
    setDisplaySearchTerm(suggestion.name)
    setSearchTerm(suggestion.name)
    setShowSuggestions(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplaySearchTerm(e.target.value)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    if (displaySearchTerm) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
    }, 100)
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">ICT Asset Inventory</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowUniqueAssetModal(true)}
            className="bg-kr-maroon hover:bg-kr-maroon-dark text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Unique Asset
          </Button>
          <Button
            onClick={() => setShowBulkAssetModal(true)}
            className="bg-kr-maroon hover:bg-kr-maroon-dark text-white"
          >
            <PackagePlus className="mr-2 h-4 w-4" />
            Add Bulk Asset
          </Button>
        </div>
        <div className="relative flex w-full max-w-sm md:max-w-xs">
          <Input
            type="search"
            placeholder="Search assets by name or serial..."
            className="flex-1 pr-10"
            value={displaySearchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            ref={searchInputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
            onClick={handleSearch}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
              {suggestions.map((asset) => (
                <div
                  key={asset.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onMouseDown={() => handleSuggestionClick(asset)}
                >
                  <span className="font-medium">{asset.name}</span>
                  <span className="text-muted-foreground ml-2">({asset.serialNumber})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => <AssetCard key={asset.id} asset={asset} />)
        ) : (
          <p className="text-center text-muted-foreground">No assets found matching your search.</p>
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block">
        {filteredAssets.length > 0 ? (
          <AssetTable assets={filteredAssets} />
        ) : (
          <p className="text-center text-muted-foreground">No assets found matching your search.</p>
        )}
      </div>

      <AddUniqueAssetForm
        open={showUniqueAssetModal}
        onOpenChange={setShowUniqueAssetModal}
        onSuccess={handleAddUniqueAsset}
      />
      <AddBulkAssetForm open={showBulkAssetModal} onOpenChange={setShowBulkAssetModal} onSuccess={handleAddBulkAsset} />
    </div>
  )
}
