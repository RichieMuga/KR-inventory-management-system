import { NextRequest, NextResponse } from "next/server";
import { AssetAssignmentService } from "@/services/assetAssignmentService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignedBy = searchParams.get("assignedBy");
    const type = (searchParams.get("type") as "unique" | "bulk") || "unique";

    if (!assignedBy) {
      return NextResponse.json(
        { error: "assignedBy parameter is required" },
        { status: 400 },
      );
    }

    const filters = {
      assignedBy,
      page: 1,
      limit: 100, // Get more results for filtering
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
    console.error("Error in assigned-by filter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
