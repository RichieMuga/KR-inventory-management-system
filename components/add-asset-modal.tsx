"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddUniqueAssetForm } from "./forms/add-unique-asset-form"
import { AddBulkAssetForm } from "./forms/add-bulk-asset-form"

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
  assetType: "unique" | "bulk"
}

export function AddAssetModal({ isOpen, onClose, assetType }: AddAssetModalProps) {
  const title = assetType === "unique" ? "Add New Unique Asset" : "Add New Bulk Asset"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {assetType === "unique" ? <AddUniqueAssetForm onClose={onClose} /> : <AddBulkAssetForm onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
