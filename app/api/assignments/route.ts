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
          error:
            "Missing required fields: assetId, assignedTo, assignedBy, quantity",
        },
        { status: 400 },
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 },
      );
    }

    // Ensure this is for a bulk asset
    const result = await AssetAssignmentService.createAssignment({
      ...body,
      quantity: parseInt(quantity), // Ensure quantity is a number
    });

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
