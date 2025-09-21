"use client";

import { useState } from "react";
import { UniqueAsset, initialUniqueAssetsData } from "@/lib/data/uniqueAssets";

// Component imports
import SearchBar from "@/components/tracking/unique-assets/search-bar";
import AssetsTable from "@/components/tracking/unique-assets/asset-table";
import AssetsCards from "@/components/tracking/unique-assets/asset-cards";

// Modal imports
import ViewAssetModal from "@/components/modals/tracking/view-unique-asset-modal";
import EditAssetModal from "@/components/modals/tracking/edit-unique-asset-modal";
import MoveAssetModal from "@/components/modals/tracking/move-unique-asset-modal";
import AssignAssetModal from "@/components/modals/tracking/assign-unique-asset-modal";
import DeleteAssetModal from "@/components/modals/tracking/delete-unique-asset-modal";

export default function UniqueAssetsTracking() {
  const [uniqueAssetsData, setUniqueAssetsData] = useState<UniqueAsset[]>(initialUniqueAssetsData);
  const [selectedAsset, setSelectedAsset] = useState<UniqueAsset | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UniqueAsset>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateAsset = (updatedAsset: Partial<UniqueAsset> & { id: string }) => {
    setUniqueAssetsData(prev =>
      prev.map(asset =>
        asset.id === updatedAsset.id
          ? { ...asset, ...updatedAsset }
          : asset
      )
    );
  };

  const handleDeleteAsset = (assetId: string) => {
    setUniqueAssetsData(prev => prev.filter(asset => asset.id !== assetId));
  };

  return (
    <div className="p-6">
      <div className="py-3 flex flex-col gap-5 sm:flex-row">
        <h1 className="text-2xl font-bold text-kr-maroon-dark">
          Unique Asset Tracking
        </h1>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* Desktop Table View */}
      <AssetsTable 
        assets={uniqueAssetsData} 
        setSelectedAsset={setSelectedAsset}
        setEditFormData={setEditFormData}
      />

      {/* Mobile Card View */}
      <AssetsCards 
        assets={uniqueAssetsData} 
        setSelectedAsset={setSelectedAsset}
        setEditFormData={setEditFormData}
      />

      {/* Modals */}
      <ViewAssetModal selectedAsset={selectedAsset} />
      <EditAssetModal 
        selectedAsset={selectedAsset}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={handleUpdateAsset}
      />
      <MoveAssetModal 
        selectedAsset={selectedAsset}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={handleUpdateAsset}
      />
      <AssignAssetModal 
        selectedAsset={selectedAsset}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={handleUpdateAsset}
      />
      <DeleteAssetModal 
        selectedAsset={selectedAsset}
        onDelete={handleDeleteAsset}
      />
    </div>
  );
}