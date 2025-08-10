import { NextResponse } from "next/server";
import { LocationService } from "@/services/locationService";
import { RoleRequest } from "@/types/request";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const locationId = parseInt(params.id, 10);

    if (isNaN(locationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid location ID" },
        { status: 400 },
      );
    }

    const location = await LocationService.getById(locationId);

    if (!location) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch location" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const locationId = parseInt(params.id, 10);

    if (isNaN(locationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid location ID" },
        { status: 400 },
      );
    }

    // Parse request body
    const body = (await request.json()) as RoleRequest & {
      regionName?: string;
      departmentName?: string;
      notes?: string;
    };

    // Check role
    if (body.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Build update payload
    const updateData: Record<string, unknown> = {};
    if (body.regionName !== undefined) updateData.regionName = body.regionName;
    if (body.departmentName !== undefined)
      updateData.departmentName = body.departmentName;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updatedLocation = await LocationService.update(
      locationId,
      updateData,
    );

    if (!updatedLocation) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedLocation });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update location" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const locationId = parseInt(params.id, 10);

    if (isNaN(locationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid location ID" },
        { status: 400 },
      );
    }

    // Parse request body to check role
    const body = (await request.json()) as { role?: string };

    if (body.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const deleted = await LocationService.delete(locationId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete location" },
      { status: 500 },
    );
  }
}
