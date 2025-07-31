import type { Metadata } from "next"
import DefaultAssetListView from "@/components/asset-list-view" // Changed to default import

export const metadata: Metadata = {
  title: "Assets | Inventory Management",
  description: "Manage your inventory assets.",
}

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
      <DefaultAssetListView />
    </div>
  )
}
