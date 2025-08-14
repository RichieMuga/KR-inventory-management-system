import { extractAssetIdFromUrl } from "@/lib/utility/extractAssetIdFromUrl";
import { withKeeperAuth } from "@/middleware/authMiddleware";
import { BulkAssetService } from "@/services/bulkAssetService";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/delete-bulk-asset/[id]
 * Delete a bulk asset (soft or hard delete — based on your service logic)
 */
export const DELETE = withKeeperAuth(async (req: Request) => {
  const nextReq = req as NextRequest;
  const assetId = extractAssetIdFromUrl(nextReq.url);

  if (isNaN(assetId)) {
    return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
  }

  try {
    const result = await BulkAssetService.deleteBulkAsset(assetId);
    if (!result) {
      return NextResponse.json(
        { error: "Asset not found or already deleted" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Bulk asset deleted successfully", assetId: result.assetId },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(`Error deleting bulk asset ID ${assetId}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to delete asset" },
      { status: 500 },
    );
  }
});
