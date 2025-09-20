// GET /api/unique-asset-tracking?page=1&limit=10&status=in_use&locationId=5&keeperPayrollNumber=EMP123
// Fetch paginated track unique assets with optional filters
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/authMiddleware";
import { UniqueAssetService } from "@/services/tracking/uniqueAssetTrackingService";

// GET /api/unique-asset-tracking?page=1&limit=10
// Fetch paginated unique assets that are in use (is_bulk = false and status = in_use)
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    
    // Set fixed filter for in_use status only
    const filters = {
      status: "in_use" as const
    };
    
    // Get tracked assets
    const result = await UniqueAssetService.getTrackedAssets(filters, { page, limit });
    
    return NextResponse.json({
      success: true,
      data: result.assets,
      pagination: result.pagination,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error fetching tracked unique assets:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch tracked unique assets", 
        details: process.env.NODE_ENV === "development" ? error.message : undefined 
      },
      { status: 500 }
    );
  }
});
