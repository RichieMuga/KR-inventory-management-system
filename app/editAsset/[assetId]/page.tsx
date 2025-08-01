import { EditAssetPage } from "@/components/asset-edit-page";

interface PageProps {
  params: {
    id: string;
  };
}

export default function AssetEditPage({ params }: PageProps) {
  return <EditAssetPage assetId={params.id} />;
}
