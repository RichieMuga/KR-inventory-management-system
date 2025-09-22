import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/authMiddleware";
import { UniqueAssetService } from "@/services/tracking/uniqueAssetAssignmentService";

// GET /api/unique-asset-tracking/[assetId]
// Get detailed information for a single unique asset
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
      
      // Get asset details
      const asset = await UniqueAssetService.getAssetById(assetId);
      
      if (!asset) {
        return NextResponse.json(
          { error: "Asset not found or is not a unique asset" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: asset,
      }, { status: 200 });
      
    } catch (error: any) {
      console.error("Error fetching unique asset details:", error);
      
      if (error.message === "Asset not found or is not a unique asset") {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to fetch asset details", 
          details: process.env.NODE_ENV === "development" ? error.message : undefined 
        },
        { status: 500 }
      );
    }
  })(req);
}