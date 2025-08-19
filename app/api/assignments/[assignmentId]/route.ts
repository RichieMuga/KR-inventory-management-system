import { NextRequest, NextResponse } from "next/server";
import { AssetAssignmentService } from "@/services/assetAssignmentService";

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
