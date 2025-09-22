// app/api/view-bulk-asset/[assetId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withKeeperAuth } from "@/middleware/authMiddleware";
import { BulkAssetService } from "@/services/bulkAssetService";

/**
 * GET /api/view-bulk-asset/[assetId]
 * Fetch a specific bulk asset by ID
 */
export const GET = withKeeperAuth(async (req: NextRequest) => {
  try {
    // Extract assetId from the URL path - FIXED VERSION
    const url = new URL(req.url);
    const assetIdStr = url.pathname.split('/').pop(); // Get the last segment
    
    if (!assetIdStr) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    const assetId = parseInt(assetIdStr, 10);

    if (isNaN(assetId)) {
      return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    }

    const asset = await BulkAssetService.getBulkAssetById(assetId);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    return NextResponse.json(asset, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching bulk asset:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch asset" },
      { status: 500 },
    );
  }
});