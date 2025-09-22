import { AssetListView } from "@/components/unique-assets/asset-unique-list-view"

export default function UniquePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <AssetListView />
      </main>
    </div>
  )
}
