"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { toggleBulkModal } from "@/lib/features/modals/asset-modal-buttons";
import { RootState } from "@/lib/store";

interface BulkAsset {
  name: string;
  serialNumber: string;
  region: string;
  location: string;
  keeper: string;
  availability: string;
  quantity: string;
  is_bulk: boolean;
}

const regions = ["Nairobi", "Mombasa", "Kisumu"];
const locations = {
  Nairobi: [
    "IT Store Room A",
    "IT Store Room B",
    "Server Room 1",
    "Server Room 2",
    "Office 101",
  ],
  Mombasa: ["Workshop 3", "Conference Room 3"],
  Kisumu: ["Tool Crib", "Training Room", "Scrap Yard"],
};
const keepers = [
  "John Doe",
  "Jane Smith",
  "Peter Jones",
  "Alice Brown",
  "David Green",
  "Sarah White",
  "Michael Black",
  "Emily Davis",
  "Chris Wilson",
  "Olivia Taylor",
];
const availabilityOptions = ["Available", "Assigned", "In Repair", "Disposed"];

export default function BulkAssetModal() {
  const dispatch = useDispatch();
  const { isBulkAssetModalOpen } = useSelector(
    (state: RootState) => state.assetModal,
  );

  const [asset, setAsset] = useState<BulkAsset>({
    name: "",
    serialNumber: "",
    region: "",
    location: "",
    keeper: "",
    availability: "Available",
    quantity: "1",
    is_bulk: true,
  });

  const updateAsset = (field: keyof BulkAsset, value: string | boolean) => {
    setAsset((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving bulk asset:", asset);
    dispatch(toggleBulkModal()); // Close the modal
    // Reset form
    setAsset({
      name: "",
      serialNumber: "",
      region: "",
      location: "",
      keeper: "",
      availability: "Available",
      quantity: "1",
      is_bulk: true,
    });
  };

  const handleClose = () => {
    dispatch(toggleBulkModal()); // Close the modal
  };

  const getAvailableLocations = (region: string) => {
    return locations[region as keyof typeof locations] || [];
  };

  return (
    <Dialog open={isBulkAssetModalOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold text-red-900">
            Add Bulk Asset
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Add a consumable item like toner cartridges, cables, and other bulk
            inventory items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mobile Card Layout */}
          <div className="lg:hidden">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Bulk Asset</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">Bulk Item</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. HP Toner Cartridge (Black)"
                    value={asset.name}
                    onChange={(e) => updateAsset("name", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Serial Number
                  </label>
                  <Input
                    placeholder="e.g. HP-TNR-BLK-001 (optional for bulk items)"
                    value={asset.serialNumber}
                    onChange={(e) =>
                      updateAsset("serialNumber", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Region <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={asset.region}
                      onValueChange={(value) => {
                        updateAsset("region", value);
                        updateAsset("location", "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 25"
                      value={asset.quantity}
                      onChange={(e) => updateAsset("quantity", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={asset.location}
                    onValueChange={(value) => updateAsset("location", value)}
                    disabled={!asset.region}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableLocations(asset.region).map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Keeper <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={asset.keeper}
                    onValueChange={(value) => updateAsset("keeper", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select keeper" />
                    </SelectTrigger>
                    <SelectContent>
                      {keepers.map((keeper) => (
                        <SelectItem key={keeper} value={keeper}>
                          {keeper}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Availability
                  </label>
                  <Select
                    value={asset.availability}
                    onValueChange={(value) =>
                      updateAsset("availability", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilityOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Form Layout */}
          <div className="hidden lg:block space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. HP Toner Cartridge (Black)"
                  value={asset.name}
                  onChange={(e) => updateAsset("name", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Serial Number
                </label>
                <Input
                  placeholder="e.g. HP-TNR-BLK-001 (optional)"
                  value={asset.serialNumber}
                  onChange={(e) => updateAsset("serialNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Region <span className="text-red-500">*</span>
                </label>
                <Select
                  value={asset.region}
                  onValueChange={(value) => {
                    updateAsset("region", value);
                    updateAsset("location", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Location <span className="text-red-500">*</span>
                </label>
                <Select
                  value={asset.location}
                  onValueChange={(value) => updateAsset("location", value)}
                  disabled={!asset.region}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableLocations(asset.region).map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 25"
                  value={asset.quantity}
                  onChange={(e) => updateAsset("quantity", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Keeper <span className="text-red-500">*</span>
                </label>
                <Select
                  value={asset.keeper}
                  onValueChange={(value) => updateAsset("keeper", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select keeper" />
                  </SelectTrigger>
                  <SelectContent>
                    {keepers.map((keeper) => (
                      <SelectItem key={keeper} value={keeper}>
                        {keeper}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Availability
                </label>
                <Select
                  value={asset.availability}
                  onValueChange={(value) => updateAsset("availability", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-red-800 hover:bg-red-900 text-white w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Bulk Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
