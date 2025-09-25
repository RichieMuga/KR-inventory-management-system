// Create a new file: app/api/assignments/debug/[assetId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AssetAssignmentService } from "@/services/assetAssignmentService";

export async function GET(
  request: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const assetId = parseInt(params.assetId);
    
    if (isNaN(assetId)) {
      return NextResponse.json(
        { error: "Invalid asset ID" },
        { status: 400 }
      );
    }

    const result = await AssetAssignmentService.getAllAssignmentsForAsset(assetId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in debug assignments GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}