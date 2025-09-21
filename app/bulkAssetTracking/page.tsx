"use client";

import { useState } from "react";
import { BulkAsset, initialBulkAssetsData } from "@/lib/data/bulkAssets";
// import Pagination from "@/components/pagination/pagination";

// Component imports
import BulkSearchBar from "@/components/tracking/bulk-assets/search-bar"
import BulkAssetsTable from "@/components/tracking/bulk-assets/asset-table";
import BulkAssetsCards from "@/components/tracking/bulk-assets/asset-card";

// Modal imports
import ViewBulkAssetModal from "@/components/modals/tracking/bulk-assets/view-bulk-asset-modal";
import EditBulkAssetModal from "@/components/modals/tracking/bulk-assets/edit-bulk-asset-modal";
import DeleteBulkAssetModal from "@/components/modals/tracking/bulk-assets/delete-bulk-asset-modal";

export default function BulkAssetsTracking() {
  const [bulkAssetsData, setBulkAssetsData] = useState<BulkAsset[]>(initialBulkAssetsData);
  const [selectedAsset, setSelectedAsset] = useState<BulkAsset | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BulkAsset>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateAsset = (updatedAsset: Partial<BulkAsset> & { id: number }) => {
    setBulkAssetsData(prev =>
      prev.map(asset =>
        asset.id === updatedAsset.id
          ? { ...asset, ...updatedAsset }
          : asset
      )
    );
  };

  const handleToggleStatus = (assetId: number) => {
    setBulkAssetsData(prev =>
      prev.map(asset =>
        asset.id === assetId
          ? {
              ...asset,
              status: asset.status === "Issued" ? "Not Issued" : "Issued",
            }
          : asset
      )
    );
  };

  const handleDeleteAsset = (assetId: number) => {
    setBulkAssetsData(prev => prev.filter(asset => asset.id !== assetId));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-5 py-3 sm:flex-row">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">
          Bulk Asset Tracking
        </h1>
        <BulkSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* Desktop Table View */}
      <BulkAssetsTable 
        assets={bulkAssetsData} 
        setSelectedAsset={setSelectedAsset}
        setEditFormData={setEditFormData}
        onToggleStatus={handleToggleStatus}
      />

      {/* Mobile Card View */}
      <BulkAssetsCards 
        assets={bulkAssetsData} 
        setSelectedAsset={setSelectedAsset}
        setEditFormData={setEditFormData}
        onToggleStatus={handleToggleStatus}
      />

      {/* Modals */}
      <ViewBulkAssetModal selectedAsset={selectedAsset} />
      <EditBulkAssetModal 
        selectedAsset={selectedAsset}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={handleUpdateAsset}
      />
      <DeleteBulkAssetModal 
        selectedAsset={selectedAsset}
        onDelete={handleDeleteAsset}
      />

      {/* <Pagination /> */}
    </div>
  );
}