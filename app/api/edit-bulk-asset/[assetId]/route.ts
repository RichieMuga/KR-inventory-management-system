import { extractRoleAndPayrollFromJWT } from "@/lib/utility/extractToken";
import { withKeeperAuth } from "@/middleware/authMiddleware";
import { BulkAssetService } from "@/services/bulkAssetService";
import { NextRequest, NextResponse } from "next/server";
import { extractAssetIdFromUrl } from "@/lib/utility/extractAssetIdFromUrl";

/**
 * PATCH /api/edit-bulk-asset/[id]
 * Partially update a bulk asset (e.g., stock level, status, thresholds)
 */

export const PATCH = withKeeperAuth(async (req: Request) => {
  const nextReq = req as NextRequest;
  const assetId = extractAssetIdFromUrl(nextReq.url);

  if (isNaN(assetId)) {
    return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
  }

  try {
    const body = await nextReq.json();

    // Extract updatedBy (keeper payroll number) from JWT
    const authHeader = nextReq.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || "";
    const { payrollNumber: updatedBy } =
      extractRoleAndPayrollFromJWT(token) || {};

    if (!updatedBy) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 },
      );
    }

    const updatedAsset = await BulkAssetService.updateBulkAsset(
      assetId,
      body,
      updatedBy,
    );

    return NextResponse.json(
      { message: "Bulk asset updated successfully", updatedAsset },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(`Error updating bulk asset ID ${assetId}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to update asset" },
      { status: 400 },
    );
  }
});
