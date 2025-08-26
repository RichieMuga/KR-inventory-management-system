import { NextRequest, NextResponse } from "next/server";
import { AssetAssignmentService } from "@/services/assetAssignmentService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const assignedBy = searchParams.get("assignedBy") || undefined;
    const assignedTo = searchParams.get("assignedTo") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = (searchParams.get("sortBy") as any) || "dateIssued";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const status =
      (searchParams.get("status") as "active" | "returned") || undefined;

    const filters = {
      assignedBy,
      assignedTo,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      status,
    };

    const result = await AssetAssignmentService.getUniqueAssignments(filters);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in unique assignments GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields for unique assignment
    const { assetId, assignedTo, assignedBy } = body;

    if (!assetId || !assignedTo || !assignedBy) {
      return NextResponse.json(
        { error: "Missing required fields: assetId, assignedTo, assignedBy" },
        { status: 400 },
      );
    }

    // Force quantity to 1 for unique assets
    const assignmentData = {
      ...body,
      quantity: 1,
    };

    const result =
      await AssetAssignmentService.createAssignment(assignmentData);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in unique assignment POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
