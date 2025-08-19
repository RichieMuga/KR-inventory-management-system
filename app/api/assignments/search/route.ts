import { NextRequest, NextResponse } from "next/server";
import { AssetAssignmentService } from "@/services/assetAssignmentService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || "";
    const type =
      (searchParams.get("type") as "unique" | "bulk" | "all") || "all";
    const assignedBy = searchParams.get("assignedBy") || undefined;
    const assignedTo = searchParams.get("assignedTo") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query.trim()) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    const filters = {
      search: query,
      assignedBy,
      assignedTo,
      page,
      limit,
    };

    let result;
    if (type === "bulk") {
      result = await AssetAssignmentService.getBulkAssignments(filters);
    } else if (type === "unique") {
      result = await AssetAssignmentService.getUniqueAssignments(filters);
    } else {
      // Search both unique and bulk, then combine results
      const [uniqueResult, bulkResult] = await Promise.all([
        AssetAssignmentService.getUniqueAssignments(filters),
        AssetAssignmentService.getBulkAssignments(filters),
      ]);

      if (!uniqueResult.success || !bulkResult.success) {
        return NextResponse.json({ error: "Search failed" }, { status: 400 });
      }

      // Combine results with proper type checks
      const combinedData = [
        ...(uniqueResult.data ?? []),
        ...(bulkResult.data ?? []),
      ];

      const uniqueTotal = uniqueResult.pagination?.totalCount ?? 0;
      const bulkTotal = bulkResult.pagination?.totalCount ?? 0;
      const totalCount = uniqueTotal + bulkTotal;

      result = {
        success: true,
        data: combinedData,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in assignments search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
