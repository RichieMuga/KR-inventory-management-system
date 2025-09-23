import { NextResponse } from "next/server";
import { LocationService } from "@/services/locationService";
import {
  withKeeperAuth,
  withAdminAuth,
  AuthenticatedRequest,
  withAuth,
} from "@/middleware/authMiddleware";
import * as schema from "@/db/schema";

// GET /api/locations/[id] - Get single location (requires keeper or admin)
async function getLocation(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
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

// PATCH /api/locations/[id] - Update location (requires admin only)
async function updateLocation(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const locationId = parseInt(params.id, 10);
    if (isNaN(locationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid location ID" },
        { status: 400 },
      );
    }

    // Parse request body
    const body = await req.json();

    // Build update payload - only include defined fields
    const updateData: Partial<schema.NewLocation> = {};
    if (body.regionName !== undefined) updateData.regionName = body.regionName;
    if (body.departmentName !== undefined)
      updateData.departmentName = body.departmentName;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

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

    return NextResponse.json({
      success: true,
      data: updatedLocation,
      message: "Location updated successfully",
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update location" },
      { status: 500 },
    );
  }
}

// DELETE /api/locations/[id] - Delete location (requires admin only)
async function deleteLocation(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const locationId = parseInt(params.id, 10);
    if (isNaN(locationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid location ID" },
        { status: 400 },
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

// Apply middleware and export
// Note: Need to wrap the handlers to match the expected signature
export async function GET(
  request: Request,
  context: { params: { id: string } },
) {
  return withAuth((req) => getLocation(req, context))(request as any);
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  return withAdminAuth((req) => updateLocation(req, context))(request as any);
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } },
) {
  return withAdminAuth((req) => deleteLocation(req, context))(request as any);
}
