import { NextRequest, NextResponse } from "next/server";
import { AssetAssignmentService } from "@/services/assetAssignmentService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = (searchParams.get("type") as "unique" | "bulk") || "unique";
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

    let result;
    if (type === "bulk") {
      result = await AssetAssignmentService.getBulkAssignments(filters);
    } else {
      result = await AssetAssignmentService.getUniqueAssignments(filters);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in bulk assignments GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields for bulk assignment
    const { assetId, assignedTo, assignedBy, quantity } = body;
    if (!assetId || !assignedTo || !assignedBy || !quantity) {
      return NextResponse.json(
        {
          error: "Missing required fields: assetId, assignedTo, assignedBy, quantity",
        },
        { status: 400 },
      );
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive integer" },
        { status: 400 },
      );
    }

    // Validate locationId if provided
    if (body.locationId && (!Number.isInteger(Number(body.locationId)) || Number(body.locationId) <= 0)) {
      return NextResponse.json(
        { error: "locationId must be a positive integer" },
        { status: 400 },
      );
    }

    // Prepare assignment data with locationId mapped to forceLocationId
    const assignmentData = {
      assetId: Number(assetId),
      assignedTo,
      assignedBy,
      quantity: parsedQuantity,
      conditionIssued: body.conditionIssued || "good",
      notes: body.notes,
      // Map locationId from request body to forceLocationId for the service
      forceLocationId: body.locationId ? Number(body.locationId) : undefined,
    };

    const result = await AssetAssignmentService.createAssignment(assignmentData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in bulk assignment POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}