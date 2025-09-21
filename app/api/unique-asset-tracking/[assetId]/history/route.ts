import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/authMiddleware";
import { UniqueAssetService } from "@/services/assignment/uniqueAssetAssignmentService";

// GET /api/unique-asset-tracking/[assetId]/history
// Get complete tracking history for a unique asset (movements and assignments)
export async function GET(
  req: NextRequest, 
  { params }: { params: { assetId: string } }
) {
  return withAuth(async (authenticatedReq: NextRequest) => {
    try {
      // Validate and parse asset ID
      const assetId = parseInt(params.assetId, 10);
      
      if (isNaN(assetId) || assetId <= 0) {
        return NextResponse.json(
          { 
            error: "Invalid asset ID",
            details: "Asset ID must be a positive number" 
          },
          { status: 400 }
        );
      }
      
      // Get asset tracking history
      const history = await UniqueAssetService.getAssetTrackingHistory(assetId);
      
      return NextResponse.json({
        success: true,
        data: {
          asset: history.asset,
          movements: history.movements,
          assignments: history.assignments,
          summary: {
            totalMovements: history.movements.length,
            totalAssignments: history.assignments.length,
            currentlyAssigned: history.assignments.some(a => !a.dateReturned),
          }
        },
      }, { status: 200 });
      
    } catch (error: any) {
      console.error("Error fetching unique asset history:", error);
      
      if (error.message === "Asset not found or is not a unique asset") {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to fetch asset history", 
          details: process.env.NODE_ENV === "development" ? error.message : undefined 
        },
        { status: 500 }
      );
    }
  })(req);
}