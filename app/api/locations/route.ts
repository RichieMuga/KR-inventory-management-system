import { NextRequest, NextResponse } from "next/server";
import { LocationService } from "@/services/locationService";
import { RoleRequest } from "@/types/request";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract role from query params (if you want role checks on GET as well)
    const role = searchParams.get("role") as RoleRequest["role"];

    if (role !== "admin" && role !== "keeper" && role !== "viewer") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;

    const [locations, totalCount] = await Promise.all([
      LocationService.getAllPaginated(limit, offset),
      LocationService.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        data: locations,
        pagination: {
          currentPage: page,
          totalPages,
      totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          previousPage: page > 1 ? page - 1 : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

