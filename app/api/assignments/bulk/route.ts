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

    const filters = {
      assignedBy,
      assignedTo,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const result = await AssetAssignmentService.getBulkAssignments(filters);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in bulk assignments GET:", error);
    return NextResponse;
  }
}
