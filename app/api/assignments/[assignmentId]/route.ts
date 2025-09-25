import { NextRequest, NextResponse } from "next/server";
import { AssetAssignmentService } from "@/services/assetAssignmentService";
import { AuthenticatedRequest, withKeeperAuth } from "@/middleware/authMiddleware";

interface RouteContext {
  params: { assignmentId: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const assignmentId = parseInt(params.assignmentId);

    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: "Invalid assignment ID" },
        { status: 400 },
      );
    }

    const result = await AssetAssignmentService.getAssignmentById(assignmentId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.message === "Assignment not found" ? 404 : 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in assignment GET by ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const assignmentId = parseInt(params.assignmentId);

    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: "Invalid assignment ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { notes } = body;

    if (notes === undefined) {
      return NextResponse.json(
        { error: "Missing notes field" },
        { status: 400 },
      );
    }

    const result = await AssetAssignmentService.updateAssignmentNotes(
      assignmentId,
      notes,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in assignment PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/assignments/[id]
export const DELETE = withKeeperAuth(async (req: AuthenticatedRequest) => {
  try {
    // Extract assignment ID from URL params
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const assignmentId = pathSegments[pathSegments.length - 1];

    if (!assignmentId || isNaN(Number(assignmentId))) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid assignment ID" 
        },
        { status: 400 }
      );
    }

    // Parse request body for optional reason
    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = body.reason;
    } catch (error) {
      // Body is optional, so we can continue without it
    }

    // Get the authenticated user info
    const deletedBy = req.user?.payrollNumber;
    if (!deletedBy) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User authentication required" 
        },
        { status: 401 }
      );
    }

    // Delete the assignment
    const result = await AssetAssignmentService.deleteAssignment(
      Number(assignmentId),
      deletedBy,
      reason
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      restoredAsset: result.restoredAsset,
      deletedBy: {
        payrollNumber: req.user?.payrollNumber,
        name: `${req.user?.firstName} ${req.user?.lastName}`,
      },
      deletedAt: new Date().toISOString(),
      reason: reason || null,
    });

  } catch (error) {
    console.error("Error deleting assignment:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete assignment",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
});

// Bulk DELETE endpoint for multiple assignments
// POST /api/assignments/bulk-delete
export async function POST(req: AuthenticatedRequest) {
  return withKeeperAuth(async (authenticatedReq: AuthenticatedRequest) => {
    try {
      const body = await authenticatedReq.json();
      const { assignmentIds, reason } = body;

      // Validate request body
      if (!assignmentIds || !Array.isArray(assignmentIds)) {
        return NextResponse.json(
          { 
            success: false, 
            error: "assignmentIds must be an array" 
          },
          { status: 400 }
        );
      }

      if (assignmentIds.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: "At least one assignment ID is required" 
          },
          { status: 400 }
        );
      }

      // Validate all IDs are numbers
      const validIds = assignmentIds.every((id: any) => 
        typeof id === 'number' || (typeof id === 'string' && !isNaN(Number(id)))
      );

      if (!validIds) {
        return NextResponse.json(
          { 
            success: false, 
            error: "All assignment IDs must be valid numbers" 
          },
          { status: 400 }
        );
      }

      const deletedBy = authenticatedReq.user?.payrollNumber;
      if (!deletedBy) {
        return NextResponse.json(
          { 
            success: false, 
            error: "User authentication required" 
          },
          { status: 401 }
        );
      }

      // Convert string IDs to numbers
      const numericIds = assignmentIds.map((id: any) => Number(id));

      // Bulk delete assignments
      const result = await AssetAssignmentService.bulkDeleteAssignments(
        numericIds,
        deletedBy,
        reason
      );

      return NextResponse.json({
        success: result.success,
        results: result.results,
        summary: result.summary,
        deletedBy: {
          payrollNumber: authenticatedReq.user?.payrollNumber,
          name: `${authenticatedReq.user?.firstName} ${authenticatedReq.user?.lastName}`,
        },
        deletedAt: new Date().toISOString(),
        reason: reason || null,
      });

    } catch (error) {
      console.error("Error bulk deleting assignments:", error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to bulk delete assignments",
          details: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      );
    }
  })(req);
}