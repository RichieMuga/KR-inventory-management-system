import { ViewAssetPage } from "@/components/asset-view-page"

interface PageProps {
  params: {
    id: string
  }
}

export default function AssetViewPage({ params }: PageProps) {
  return <ViewAssetPage assetId={params.id} />
}
