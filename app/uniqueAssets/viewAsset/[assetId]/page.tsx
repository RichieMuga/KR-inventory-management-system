import { ViewUniqueAssetPage } from "@/components/unique-asset-view-and-edit-pages/view-unique-asset-page"

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

  return <ViewUniqueAssetPage assetId={assetId} />
}