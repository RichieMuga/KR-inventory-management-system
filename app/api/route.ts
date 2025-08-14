// Endpoint for store keeping bulk asset page in the index page
// GET and POST /api/bulk-assets
import { NextRequest, NextResponse } from "next/server";
import { withAuth, withKeeperAuth } from "@/middleware/authMiddleware";
import { BulkAssetService } from "@/services/bulkAssetService";
import { extractRoleAndPayrollFromJWT } from "@/lib/utility/extractToken";

// POST /api
// Creates a new bulk asset entry
export const POST = withKeeperAuth(async (req: NextRequest) => {
  try {
    // Extract creator info from JWT (for audit/logging)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || "";
    const { payrollNumber: creatorPayroll } = extractRoleAndPayrollFromJWT(token) || {};

    // Parse request body
    const body = await req.json();
    const { keeperPayrollNumber, ...assetData } = body;

    // Create bulk asset
    const result = await BulkAssetService.createBulkAsset({
      ...assetData,
      keeperPayrollNumber: keeperPayrollNumber || creatorPayroll, // fallback to token
    });

    return NextResponse.json(
      {
        message: "Bulk asset created successfully",
        createdBy: creatorPayroll,
        result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create bulk asset" },
      { status: 400 }
    );
  }
});

// GET /api?page=1&limit=10
// Fetch all bulk assets with pagination
export const GET = withAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const result = await BulkAssetService.getAllBulkAssets(page, limit);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching bulk assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch bulk assets" },
      { status: 500 }
    );
  }
});
