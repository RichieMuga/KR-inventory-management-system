"use client"

import type React from "react"

import { useState, useMemo, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AssetCard } from "./asset-card"
import { AssetTable } from "./asset-table"
import { Search } from "lucide-react"

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

interface AssetListViewProps {
  assets: Asset[] // Now accepts assets as a prop
}

export function AssetListView({ assets }: AssetListViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [displaySearchTerm, setDisplaySearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const allAssets = useMemo(() => assets, [assets]) // Use the passed assets

  const suggestions = useMemo(() => {
    if (!displaySearchTerm) return []
    const lowerCaseSearchTerm = displaySearchTerm.toLowerCase()
    return allAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)),
    )
  }, [displaySearchTerm, allAssets])

  const filteredAssets = useMemo(() => {
    if (!searchTerm) {
      return allAssets
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return allAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)) ||
        asset.location.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.region.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.keeper.toLowerCase().includes(lowerCaseSearchTerm) ||
        asset.availability.toLowerCase().includes(lowerCaseSearchTerm),
    )
  }, [searchTerm, allAssets])

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
                  {asset.serialNumber && <span className="text-muted-foreground ml-2">({asset.serialNumber})</span>}
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
    </div>
  )
}
