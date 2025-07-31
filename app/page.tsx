import { Header } from "@/components/layout/header"
import AssetListView from "@/components/asset-list-view" // Changed to default import

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <AssetListView />
      </main>
    </div>
  )
}
