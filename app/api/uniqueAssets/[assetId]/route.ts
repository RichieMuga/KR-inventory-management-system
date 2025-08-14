import { NextRequest, NextResponse } from "next/server";
import { withKeeperAuth } from "@/middleware/authMiddleware";
import { UniqueAssetService } from "@/services/uniqueAssetService";

// GET /api/uniqueAssets/[assetId]
// Fetch a single unique asset by ID
export const GET = withKeeperAuth(async (req: NextRequest) => {
  const url = new URL(req.url);
  const path = url.pathname; // e.g., /api/uniqueAssets/123
  const assetId = extractIdFromPath(path);

  if (isNaN(assetId)) {
    return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
  }

  try {
    const asset = await UniqueAssetService.getUniqueAssetById(assetId);
    if (!asset) {
      return NextResponse.json(
        { error: "Unique asset not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(asset, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching unique asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset", details: error.message },
      { status: 500 },
    );
  }
});

// PATCH /api/uniqueAssets/[assetId]
// Update a unique asset
export const PATCH = withKeeperAuth(async (req: NextRequest) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const assetId = extractIdFromPath(path);

  if (isNaN(assetId)) {
    return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
  }

  try {
    const body = await req.json();

    const updateData: {
      name?: string;
      serialNumber?: string;
      modelNumber?: string | null;
      individualStatus?: "in_use" | "not_in_use" | "retired";
      keeperPayrollNumber?: string | null;
      notes?: string; // ← must be string | undefined, not null
    } = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.serialNumber !== undefined)
      updateData.serialNumber = body.serialNumber.trim();
    if (body.modelNumber !== undefined) {
      updateData.modelNumber = body.modelNumber?.trim() ?? null;
    }
    if (body.individualStatus !== undefined) {
      const status = body.individualStatus;
      if (!["in_use", "not_in_use", "retired"].includes(status)) {
        return NextResponse.json(
          {
            error:
              "individualStatus must be 'in_use', 'not_in_use', or 'retired'",
          },
          { status: 400 },
        );
      }
      updateData.individualStatus = status;
    }
    if (body.keeperPayrollNumber !== undefined) {
      updateData.keeperPayrollNumber = body.keeperPayrollNumber?.trim() ?? null;
    }
    if (body.notes !== undefined) {
      const trimmed = body.notes?.trim();
      updateData.notes = trimmed === "" ? undefined : trimmed; // ✅ never null
    }

    // Block bulk-only fields
    const forbiddenFields = [
      "bulkStatus",
      "currentStockLevel",
      "minimumThreshold",
      "lastRestocked",
      "isBulk",
    ];
    const receivedKeys = Object.keys(body);
    if (receivedKeys.some((key) => forbiddenFields.includes(key))) {
      return NextResponse.json(
        {
          error: "Cannot update bulk-only or protected fields on unique asset",
        },
        { status: 400 },
      );
    }

    // Get user from request (attached by middleware)
    const user = (req as any).user;
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: User not found" },
        { status: 401 },
      );
    }

    const updatedAsset = await UniqueAssetService.updateUniqueAsset(
      assetId,
      updateData,
      user.payrollNumber,
    );

    return NextResponse.json(
      {
        message: "Unique asset updated successfully",
        updatedBy: user.payrollNumber,
        asset: updatedAsset,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating unique asset:", error);
    if (error.message?.includes("not found")) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    if (error.message?.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to update asset", details: error.message },
      { status: 500 },
    );
  }
});

// DELETE /api/uniqueAssets/[assetId]
// Delete a unique asset
export const DELETE = withKeeperAuth(async (req: NextRequest) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const assetId = extractIdFromPath(path);

  if (isNaN(assetId)) {
    return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
  }

  try {
    const user = (req as any).user;
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: User not found" },
        { status: 401 },
      );
    }

    const deletedAsset = await UniqueAssetService.deleteUniqueAsset(assetId);

    if (!deletedAsset) {
      return NextResponse.json(
        { error: "Asset not found or already deleted" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Unique asset deleted successfully",
        deletedBy: user.payrollNumber,
        asset: deletedAsset,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting unique asset:", error);
    if (error.message?.includes("not found")) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete asset", details: error.message },
      { status: 500 },
    );
  }
});

// Utility: Extract ID from path like `/api/uniqueAssets/123`
function extractIdFromPath(path: string): number {
  const parts = path.split("/").filter(Boolean);
  const idStr = parts[parts.length - 1]; // Last segment
  return parseInt(idStr, 10);
}
