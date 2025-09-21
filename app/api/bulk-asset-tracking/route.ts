import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/authMiddleware";
import { BulkAssetService } from "@/services/tracking-and-movement/bulkAssetAssignmentService";

// GET /api/bulk-asset-tracking?page=1&limit=10&search=laptop&status=active&locationId=1&lowStockOnly=true
// Fetch paginated bulk assets with search and filtering capabilities
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
   
    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    
    // Parse search parameter
    const search = searchParams.get("search") || "";
    
    // Parse filter parameters with proper typing
    const statusParam = searchParams.get("status");
    let status: "active" | "out_of_stock" | "discontinued" | undefined;
    
    if (statusParam === "active" || statusParam === "out_of_stock" || statusParam === "discontinued") {
      status = statusParam;
    } else {
      status = "active"; // Default to active
    }
    
    const locationIdParam = searchParams.get("locationId");
    const locationId = locationIdParam ? parseInt(locationIdParam, 10) : undefined;
    
    const lowStockOnlyParam = searchParams.get("lowStockOnly");
    const lowStockOnly = lowStockOnlyParam === "true";
   
    // Combine all options into a single object with proper typing
    const options: {
      page: number;
      limit: number;
      search?: string;
      status?: "active" | "out_of_stock" | "discontinued";
      locationId?: number;
      lowStockOnly?: boolean;
    } = {
      page,
      limit,
      search: search.trim() || undefined,
      status,
      locationId,
      lowStockOnly
    };
   
    // Get tracked bulk assets with search and filtering
    const result = await BulkAssetService.getTrackedBulkAssets(options);
   
    return NextResponse.json({
      success: true,
      data: result.assets,
      pagination: result.pagination,
      summary: result.summary, // Include summary for additional insights
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