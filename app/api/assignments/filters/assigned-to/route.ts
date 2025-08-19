import { NextRequest, NextResponse } from "next/server";
import { AssetAssignmentService } from "@/services/assetAssignmentService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get("assignedTo");
    const type = (searchParams.get("type") as "unique" | "bulk") || "unique";

    if (!assignedTo) {
      return NextResponse.json(
        { error: "assignedTo parameter is required" },
        { status: 400 },
      );
    }

    const filters = {
      assignedTo,
      page: 1,
      limit: 100,
    };

    let result;
    if (type === "bulk") {
      result = await AssetAssignmentService.getBulkAssignments(filters);
    } else {
      result = await AssetAssignmentService.getUniqueAssignments(filters);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in assignments GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      assetId,
      assignedTo,
      assignedBy,
      quantity,
      assignmentDate,
      dueDate,
      notes,
    } = body;

    if (!assetId || !assignedTo || !assignedBy || quantity === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: assetId, assignedTo, assignedBy, quantity",
        },
        { status: 400 },
      );
    }

    // Validate quantity is a positive number
    if (typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive number" },
        { status: 400 },
      );
    }

    // Prepare assignment data
    const assignmentData = {
      assetId,
      assignedTo,
      assignedBy,
      quantity,
      assignmentDate: assignmentDate || new Date().toISOString(),
      dueDate: dueDate || null,
      notes: notes || "",
      status: "active",
    };

    // Create the assignment
    const result =
      await AssetAssignmentService.createAssignment(assignmentData);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in assignments POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
