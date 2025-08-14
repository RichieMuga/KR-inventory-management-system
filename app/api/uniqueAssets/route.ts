import { NextRequest, NextResponse } from "next/server";
import { withAuth, withKeeperAuth } from "@/middleware/authMiddleware";
import { UniqueAssetService } from "@/services/uniqueAssetService";
import { extractRoleAndPayrollFromJWT } from "@/lib/utility/extractToken";

// POST /api/unique-assets
// Creates a new unique asset
export const POST = withKeeperAuth(async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || "";
    const { payrollNumber: creatorPayroll } =
      extractRoleAndPayrollFromJWT(token) || {};

    const body = await req.json();

    console.log("Request body received:", body); // Debug log

    // ✅ Explicitly pick and validate fields
    const name = body.name?.trim();
    const locationId = Number(body.locationId);
    const serialNumber = body.serialNumber?.trim();
    const modelNumber = body.modelNumber?.trim() || null;
    const individualStatus = body.individualStatus || "not_in_use"; // Default value
    const keeperPayrollNumber = body.keeperPayrollNumber?.trim() || null; // Don't auto-assign creator
    const notes = body.notes?.trim() || null; // ✅ Add notes support

    // ✅ Strict validation
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (isNaN(locationId)) {
      return NextResponse.json(
        { error: "Valid locationId is required" },
        { status: 400 },
      );
    }
    if (!serialNumber) {
      return NextResponse.json(
        { error: "Serial number is required" },
        { status: 400 },
      );
    }
    if (!["in_use", "not_in_use", "retired"].includes(individualStatus)) {
      return NextResponse.json(
        {
          error:
            "individualStatus must be 'in_use', 'not_in_use', or 'retired'",
        },
        { status: 400 },
      );
    }

    // ✅ Block bulk-only fields
    if (
      body.hasOwnProperty("bulkStatus") ||
      body.hasOwnProperty("currentStockLevel") ||
      body.hasOwnProperty("minimumThreshold") ||
      body.hasOwnProperty("lastRestocked")
    ) {
      return NextResponse.json(
        { error: "Bulk asset fields not allowed for unique assets" },
        { status: 400 },
      );
    }

    // ✅ Block isBulk override
    if (body.isBulk === true) {
      return NextResponse.json(
        { error: "Cannot create unique asset with isBulk = true" },
        { status: 400 },
      );
    }

    // ✅ Prepare data for service
    const assetData = {
      name,
      locationId,
      serialNumber,
      modelNumber,
      individualStatus,
      keeperPayrollNumber,
      notes, // ✅ Include notes
    };

    console.log(
      "Calling UniqueAssetService.createUniqueAsset with:",
      assetData,
    ); // Debug log

    const result = await UniqueAssetService.createUniqueAsset(assetData);

    return NextResponse.json(
      {
        message: "Unique asset created successfully",
        createdBy: creatorPayroll,
        result,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating unique asset:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create unique asset" },
      { status: 400 },
    );
  }
});

// GET /api/unique-assets?page=1&limit=10&status=in_use&locationId=5&keeperPayrollNumber=EMP123
// Fetch paginated unique assets with optional filters
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "10", 10),
      100,
    );

    const filters: {
      status?: "in_use" | "not_in_use" | "retired";
      locationId?: number;
      keeperPayrollNumber?: string;
    } = {};

    const status = searchParams.get("status");
    if (status && ["in_use", "not_in_use", "retired"].includes(status)) {
      filters.status = status as "in_use" | "not_in_use" | "retired";
    }

    const locationId = searchParams.get("locationId");
    if (locationId) {
      const id = parseInt(locationId, 10);
      if (!isNaN(id)) filters.locationId = id;
    }

    const keeperPayrollNumber = searchParams.get("keeperPayrollNumber");
    if (keeperPayrollNumber) {
      filters.keeperPayrollNumber = keeperPayrollNumber;
    }

    const result = await UniqueAssetService.getAllUniqueAssets(
      page,
      limit,
      filters,
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching unique assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch unique assets" },
      { status: 500 },
    );
  }
});
