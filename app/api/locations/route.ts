import { NextRequest, NextResponse } from "next/server";
import { LocationService } from "@/services/locationService";
import {
  withKeeperAuth,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import * as schema from "@/db/schema";

// GET /api/locations - Get all locations with pagination and search
async function getLocations(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10")),
    );
    const offset = (page - 1) * limit;

    // Search parameter
    const search = searchParams.get("search")?.trim() || "";

    // Fetch locations with search (pass search to both methods)
    const [locations, totalCount] = await Promise.all([
      LocationService.getAllPaginated(limit, offset, search || undefined),
      LocationService.count(search || undefined),
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
        // Include search info in response
        search: search || undefined,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}

// POST /api/locations - Create new location (requires keeper or admin)
async function createLocation(
  req: AuthenticatedRequest,
): Promise<NextResponse> {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.regionName || !body.departmentName) {
      return NextResponse.json(
        {
          success: false,
          error: "Region name and department name are required",
        },
        { status: 400 },
      );
    }

    // Prepare location data
    const locationData: schema.NewLocation = {
      regionName: body.regionName,
      departmentName: body.departmentName,
      notes: body.notes || null,
    };

    const newLocation = await LocationService.create(locationData);

    return NextResponse.json(
      {
        success: true,
        data: newLocation,
        message: "Location created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create location" },
      { status: 500 },
    );
  }
}

// Apply middleware and export
export const GET = withKeeperAuth(getLocations);
export const POST = withKeeperAuth(createLocation);
