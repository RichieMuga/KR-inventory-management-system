import { EditUniqueAssetPage } from "@/components/unique-asset-view-and-edit-pages/edit-unique-asset-page";

interface PageProps {
  params: Promise<{
    assetId: string
  }>
}

export default async function AssetEditPage({ params }: PageProps) {
   const { assetId } = await params;
  
  if (!assetId) {
    return <div>Error: No asset ID found</div>;
  }

  return <EditUniqueAssetPage assetId={assetId}/>
}