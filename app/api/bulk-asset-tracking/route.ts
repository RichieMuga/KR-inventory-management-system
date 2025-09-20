import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/authMiddleware";
import { BulkAssetService } from "@/services/tracking/bulkAssetTrackingService";

// GET /api/bulk-asset-tracking?page=1&limit=10
// Fetch paginated bulk assets that are active (is_bulk = true and status = active)
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    
    // Set fixed filter for active status only
    const filters = {
      status: "active" as const
    };
    
    // Get tracked bulk assets
    const result = await BulkAssetService.getTrackedBulkAssets(filters, { page, limit });
    
    return NextResponse.json({
      success: true,
      data: result.assets,
      pagination: result.pagination,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error fetching tracked bulk assets:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch tracked bulk assets", 
        details: process.env.NODE_ENV === "development" ? error.message : undefined 
      },
      { status: 500 }
    );
  }
});