// /api/bulk-asset-tracking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/authMiddleware";
import { BulkAssetService } from "@/services/assignment/bulkAssetTrackingService";

// GET /api/bulk-asset-tracking
// Get all tracked bulk assets with pagination and filtering
export async function GET(req: NextRequest) {
  return withAuth(async (authenticatedReq: NextRequest) => {
    try {
      // Parse query parameters
      const { searchParams } = new URL(req.url);
     
      // Pagination parameters
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100); // Max 100 per page
     
      // Filter parameters
      const search = searchParams.get("search") || "";
      const statusParam = searchParams.get("status") || "";
      const locationId = searchParams.get("locationId") ? parseInt(searchParams.get("locationId")!, 10) : undefined;
      const lowStockOnly = searchParams.get("lowStockOnly") === "true";

      // Validate pagination parameters
      if (isNaN(page) || page < 1) {
        return NextResponse.json(
          {
            error: "Invalid page parameter",
            details: "Page must be a positive number"
          },
          { status: 400 }
        );
      }

      if (isNaN(limit) || limit < 1) {
        return NextResponse.json(
          {
            error: "Invalid limit parameter",
            details: "Limit must be a positive number"
          },
          { status: 400 }
        );
      }

      // Validate locationId if provided
      if (locationId !== undefined && (isNaN(locationId) || locationId <= 0)) {
        return NextResponse.json(
          {
            error: "Invalid locationId parameter",
            details: "LocationId must be a positive number"
          },
          { status: 400 }
        );
      }

      // Validate and type-check status parameter
      const validStatuses = ["active", "out_of_stock", "discontinued"] as const;
      type ValidStatus = typeof validStatuses[number];
      
      let status: ValidStatus | undefined = undefined;
      
      if (statusParam && validStatuses.includes(statusParam as ValidStatus)) {
        status = statusParam as ValidStatus;
      } else if (statusParam) {
        return NextResponse.json(
          {
            error: "Invalid status parameter",
            details: `Status must be one of: ${validStatuses.join(", ")}`
          },
          { status: 400 }
        );
      }

      // Get tracked bulk assets
      const result = await BulkAssetService.getTrackedBulkAssets({
        page,
        limit,
        search: search.trim(),
        status, // Now properly typed as ValidStatus | undefined
        locationId,
        lowStockOnly,
      });

      return NextResponse.json({
        success: true,
        data: result,
        filters: {
          page,
          limit,
          search: search.trim(),
          status: status || null,
          locationId: locationId || null,
          lowStockOnly,
        },
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
  })(req);
}