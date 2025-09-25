// app/api/assignments/bulk-delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AssetAssignmentService } from "@/services/assetAssignmentService";
import { withKeeperAuth, type AuthenticatedRequest } from "@/middleware/authMiddleware";

// POST /api/assignments/bulk-delete
export const POST = withKeeperAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
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
        payrollNumber: req.user?.payrollNumber,
        name: `${req.user?.firstName} ${req.user?.lastName}`,
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
});