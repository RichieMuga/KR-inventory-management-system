// GET /api/unique-asset-tracking?page=1&limit=10&search=laptop&status=in_use&locationId=5&keeperPayrollNumber=EMP123
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/authMiddleware";
import { UniqueAssetService } from "@/services/tracking/uniqueAssetAssignmentService";

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
   
    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
   
    // Parse search parameter
    const search = searchParams.get("search")?.trim();
   
    // Parse optional filters
    const status = searchParams.get("status") as "in_use" | "not_in_use" | "retired" | null;
    const locationId = searchParams.get("locationId");
    const keeperPayrollNumber = searchParams.get("keeperPayrollNumber")?.trim();
    const assignedTo = searchParams.get("assignedTo")?.trim();
   
    // Build filters object
    const filters: any = {};

    // Add status filter (default to in_use if no search term)
    if (status) {
      filters.status = status;
    } else if (!search) {
      // Default to in_use when no search is provided (maintains backward compatibility)
      filters.status = "in_use";
    }

    // Add optional filters if provided
    if (locationId && !isNaN(parseInt(locationId))) {
      filters.locationId = parseInt(locationId, 10);
    }
    
    if (keeperPayrollNumber) {
      filters.keeperPayrollNumber = keeperPayrollNumber;
    }

    if (assignedTo) {
      filters.assignedTo = assignedTo;
    }

    // Add search if provided
    if (search) {
      filters.searchTerm = search;
    }
   
    // Get tracked assets
    const result = await UniqueAssetService.getTrackedAssets(filters, { page, limit });

    // Get summary statistics
    const summary = await UniqueAssetService.getTrackingSummary();
   
    return NextResponse.json({
      success: true,
      data: result.assets,
      pagination: result.pagination,
      summary: {
        totalAssets: summary.totalUniqueAssets,
        inUseAssets: summary.inUse,
        availableAssets: summary.notInUse,
        assignedAssets: summary.currentlyAssigned,
        retiredAssets: summary.retired
      }
    }, { status: 200 });
   
  } catch (error: any) {
    console.error("Error fetching tracked unique assets:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tracked unique assets",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
});