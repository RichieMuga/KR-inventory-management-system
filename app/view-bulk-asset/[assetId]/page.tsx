import { ViewAssetPage } from "@/components/asset-view-page"

interface PageProps {
  params: Promise<{
    assetId: string
  }>
}

export default async function AssetViewPage({ params }: PageProps) {
  const { assetId } = await params;
  
  if (!assetId) {
    return <div>Error: No asset ID found</div>;
  }

  return <ViewAssetPage assetId={assetId} />
}