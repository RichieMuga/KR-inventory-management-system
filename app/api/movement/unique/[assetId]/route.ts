// app/api/bulk-assets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withKeeperAuth } from "@/middleware/authMiddleware";
import { AssetMovementService } from "@/services/movement/assetMovementService";

/**
 * GET /api/movement/[assetId]
 * Fetch a specific unique assetId movement
 */
export const GET = withKeeperAuth(async (req: Request) => {
  // Since we're in App Router, cast to NextRequest to access URL and params
  const nextReq = req as NextRequest;
  const path = nextReq.nextUrl.pathname;
  const parts = path.split("/");
  const idStr = parts.pop() || parts.pop(); // Extract last non-empty part
  const assetId = parseInt(idStr as string, 10);

  if (!idStr || isNaN(assetId)) {
    return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
  }

  try {
    const asset = await AssetMovementService.getAssetMovements(assetId)
    if (!asset) {
      return NextResponse.json({ error: "Asset movement not found" }, { status: 404 });
    }
    return NextResponse.json(asset, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching bulk asset ID movement ${assetId}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch asset movement" },
      { status: 500 },
    );
  }
});
