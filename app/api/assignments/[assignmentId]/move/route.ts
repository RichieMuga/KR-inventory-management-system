// app/api/assignments/[assignmentId]/move/route.ts

import { NextResponse } from "next/server";
import { withKeeperAuth, type AuthenticatedRequest } from "@/middleware/authMiddleware";
import { AssetAssignmentService } from "@/services/movement/assetMovementWhileAssignedService";

interface MoveAssignedAssetRequest {
  toLocationId: number;
  notes?: string;
}

async function moveAssignedAssetHandler(
  req: AuthenticatedRequest
): Promise<NextResponse> {
  // Extract assetId from URL pathname
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const assignmentIdIndex = pathParts.findIndex(part => part === 'assignments') + 1;
  const assetId = parseInt(pathParts[assignmentIdIndex]);

  try {
    if (isNaN(assetId)) {
      return NextResponse.json(
        { error: "Invalid assignment ID" },
        { status: 400 }
      );
    }

    // Parse request body
    let requestData: MoveAssignedAssetRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!requestData.toLocationId) {
      return NextResponse.json(
        { error: "toLocationId is required" },
        { status: 400 }
      );
    }

    if (typeof requestData.toLocationId !== "number" || requestData.toLocationId <= 0) {
      return NextResponse.json(
        { error: "toLocationId must be a positive number" },
        { status: 400 }
      );
    }

    // Optional notes validation
    if (requestData.notes && typeof requestData.notes !== "string") {
      return NextResponse.json(
        { error: "notes must be a string" },
        { status: 400 }
      );
    }

    // Call the service to move the assigned asset
    const result = await AssetAssignmentService.moveAssignedAsset({
      assetId,
      toLocationId: requestData.toLocationId,
      movedBy: req.user!.payrollNumber,
      notes: requestData.notes?.trim() || undefined,
    });

    if (!result.success) {
      // Determine appropriate status code based on the error message
      let statusCode = 400; // Default to bad request
      
      if (result.message.includes("not found")) {
        statusCode = 404;
      } else if (result.message.includes("already at")) {
        statusCode = 409; // Conflict
      } else if (result.message.includes("Invalid user")) {
        statusCode = 401;
      } else if (result.message.includes("internal error")) {
        statusCode = 500;
      }

      return NextResponse.json(
        { 
          error: result.message,
          success: false 
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        movementId: result.movementId,
        updatedAsset: result.updatedAsset,
      },
    });

  } catch (error) {
    console.error("Error in move assigned asset endpoint:", error);
    return NextResponse.json(
      { 
        error: "An unexpected error occurred while moving the assigned asset",
        success: false 
      },
      { status: 500 }
    );
  }
}

// Export the handler with authentication middleware wrapping the method
export const PATCH = withKeeperAuth(moveAssignedAssetHandler);