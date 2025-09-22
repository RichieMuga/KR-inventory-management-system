import { extractRoleAndPayrollFromJWT } from "@/lib/utility/extractToken";
import { withKeeperAuth } from "@/middleware/authMiddleware";
import { BulkAssetService } from "@/services/bulkAssetService";
import { NextRequest, NextResponse } from "next/server";
import { extractAssetIdFromUrl } from "@/lib/utility/extractAssetIdFromUrl";

// Validation schema (you could use Zod for more robust validation)
interface UpdateBulkAssetRequest {
  quantity?: number;
  minimumThreshold?: number;
  modelNumber?: string;
  keeperPayrollNumber?: string;
  locationId?: number;
  notes?: string;
}

/**
 * PATCH /api/edit-bulk-asset/[id]
 * Update a bulk asset including keeper, location, stock level, and other properties
 */
export const PATCH = withKeeperAuth(async (req: Request) => {
  const nextReq = req as NextRequest;
  const assetId = extractAssetIdFromUrl(nextReq.url);
  
  if (isNaN(assetId)) {
    return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
  }

  try {
    const body: UpdateBulkAssetRequest = await nextReq.json();
    
    // Basic validation
    if (body.quantity !== undefined && (typeof body.quantity !== 'number' || body.quantity < 0)) {
      return NextResponse.json({ error: "Quantity must be a non-negative number" }, { status: 400 });
    }
    
    if (body.minimumThreshold !== undefined && (typeof body.minimumThreshold !== 'number' || body.minimumThreshold < 0)) {
      return NextResponse.json({ error: "Minimum threshold must be a non-negative number" }, { status: 400 });
    }
    
    if (body.locationId !== undefined && (typeof body.locationId !== 'number' || body.locationId <= 0)) {
      return NextResponse.json({ error: "Location ID must be a positive number" }, { status: 400 });
    }

    if (body.keeperPayrollNumber !== undefined && typeof body.keeperPayrollNumber !== 'string') {
      return NextResponse.json({ error: "Keeper payroll number must be a string" }, { status: 400 });
    }

    // Extract updatedBy (keeper payroll number) from JWT
    const authHeader = nextReq.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || "";
    const { payrollNumber: updatedBy } = extractRoleAndPayrollFromJWT(token) || {};
    
    if (!updatedBy) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    const updatedAsset = await BulkAssetService.updateBulkAsset(
      assetId,
      body,
      updatedBy
    );

    return NextResponse.json(
      { 
        message: "Bulk asset updated successfully", 
        updatedAsset,
        changes: {
          quantityChanged: body.quantity !== undefined,
          keeperChanged: body.keeperPayrollNumber !== undefined,
          locationChanged: body.locationId !== undefined,
          thresholdChanged: body.minimumThreshold !== undefined,
          modelNumberChanged: body.modelNumber !== undefined
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error updating bulk asset ID ${assetId}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to update asset" },
      { status: 400 }
    );
  }
});