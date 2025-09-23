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
  console.log('🔍 PATCH ENDPOINT CALLED - START');
  
  const url = new URL(req.url);
  const path = url.pathname;
  console.log('🔍 REQUEST URL PATH:', path);
  
  const assetId = extractIdFromPath(path);
  console.log('🔍 EXTRACTED ASSET ID:', assetId);
  
  if (isNaN(assetId)) {
    console.log('❌ INVALID ASSET ID:', assetId);
    return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
  }

  try {
    console.log('🔍 PARSING REQUEST BODY...');
    const body = await req.json();
    console.log('🔍 RAW REQUEST BODY:', JSON.stringify(body, null, 2));
    console.log('🔍 REQUEST BODY KEYS:', Object.keys(body));
    
    const updateData: {
      name?: string;
      serialNumber?: string;
      modelNumber?: string | null;
      individualStatus?: "in_use" | "not_in_use" | "retired";
      keeperPayrollNumber?: string | null;
      locationId?: number;
      notes?: string;
    } = {};
    
    // Name field
    if (body.name !== undefined) {
      updateData.name = body.name.trim();
      console.log('🔍 PROCESSED name:', updateData.name);
    }
    
    // Serial Number field
    if (body.serialNumber !== undefined) {
      updateData.serialNumber = body.serialNumber.trim();
      console.log('🔍 PROCESSED serialNumber:', updateData.serialNumber);
    }
    
    // Model Number field
    if (body.modelNumber !== undefined) {
      updateData.modelNumber = body.modelNumber?.trim() ?? null;
      console.log('🔍 PROCESSED modelNumber:', updateData.modelNumber);
    }
    
    // Individual Status field
    if (body.individualStatus !== undefined) {
      const status = body.individualStatus;
      console.log('🔍 PROCESSING individualStatus:', status);
      
      if (!["in_use", "not_in_use", "retired"].includes(status)) {
        console.log('❌ INVALID individualStatus:', status);
        return NextResponse.json(
          {
            error: "individualStatus must be 'in_use', 'not_in_use', or 'retired'",
          },
          { status: 400 },
        );
      }
      updateData.individualStatus = status;
      console.log('🔍 VALID individualStatus:', updateData.individualStatus);
    }
    
    // Keeper Payroll Number field
    if (body.keeperPayrollNumber !== undefined) {
      updateData.keeperPayrollNumber = body.keeperPayrollNumber?.trim() ?? null;
      console.log('🔍 PROCESSED keeperPayrollNumber:', updateData.keeperPayrollNumber);
    }
    
    // Location ID field
    if (body.locationId !== undefined) {
      console.log('🔍 PROCESSING locationId:', body.locationId);
      const locationId = parseInt(body.locationId);
      
      if (isNaN(locationId)) {
        console.log('❌ INVALID locationId:', body.locationId);
        return NextResponse.json(
          { error: "locationId must be a valid number" },
          { status: 400 }
        );
      }
      updateData.locationId = locationId;
      console.log('🔍 VALID locationId:', updateData.locationId);
    }
    
    // Notes field
    if (body.notes !== undefined) {
      const trimmed = body.notes?.trim();
      updateData.notes = trimmed === "" ? undefined : trimmed;
      console.log('🔍 PROCESSED notes:', updateData.notes);
    }
    
    console.log('🔍 FINAL UPDATE DATA:', JSON.stringify(updateData, null, 2));
    console.log('🔍 UPDATE DATA KEYS:', Object.keys(updateData));
    
    // Block bulk-only fields
    const forbiddenFields = [
      "bulkStatus",
      "currentStockLevel",
      "minimumThreshold",
      "lastRestocked",
      "isBulk",
    ];
    const receivedKeys = Object.keys(body);
    console.log('🔍 CHECKING FOR FORBIDDEN FIELDS...');
    console.log('🔍 RECEIVED KEYS:', receivedKeys);
    console.log('🔍 FORBIDDEN FIELDS:', forbiddenFields);
    
    const forbiddenFound = receivedKeys.filter(key => forbiddenFields.includes(key));
    if (forbiddenFound.length > 0) {
      console.log('❌ FORBIDDEN FIELDS FOUND:', forbiddenFound);
      return NextResponse.json(
        {
          error: "Cannot update bulk-only or protected fields on unique asset",
        },
        { status: 400 },
      );
    }
    console.log('✅ NO FORBIDDEN FIELDS FOUND');
    
    // Get user from request (attached by middleware)
    const user = (req as any).user;
    console.log('🔍 USER FROM REQUEST:', user ? {
      payrollNumber: user.payrollNumber,
      hasPayrollNumber: !!user.payrollNumber
    } : 'NO USER FOUND');
    
    if (!user) {
      console.log('❌ UNAUTHORIZED: User not found in request');
      return NextResponse.json(
        { error: "Unauthorized: User not found" },
        { status: 401 },
      );
    }

    console.log('🔍 CALLING UniqueAssetService.updateUniqueAsset...');
    console.log('🔍 SERVICE PARAMS:', {
      assetId,
      updates: updateData,
      updatedBy: user.payrollNumber
    });
    
    const updatedAsset = await UniqueAssetService.updateUniqueAsset(
      assetId,
      updateData,
      user.payrollNumber,
    );
    
    console.log('✅ ASSET UPDATED SUCCESSFULLY');
    console.log('🔍 UPDATED ASSET RESPONSE:', JSON.stringify(updatedAsset, null, 2));
    
    return NextResponse.json(
      {
        message: "Unique asset updated successfully",
        updatedBy: user.payrollNumber,
        asset: updatedAsset,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('❌ ERROR UPDATING UNIQUE ASSET:', error);
    console.error('❌ ERROR STACK:', error.stack);
    console.error('❌ ERROR MESSAGE:', error.message);
    
    if (error.message?.includes("not found")) {
      console.log('❌ ASSET NOT FOUND ERROR');
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    if (error.message?.includes("already exists")) {
      console.log('❌ DUPLICATE ASSET ERROR');
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    console.log('❌ GENERIC SERVER ERROR');
    return NextResponse.json(
      { error: "Failed to update asset", details: error.message },
      { status: 500 },
    );
  } finally {
    console.log('🔍 PATCH ENDPOINT CALLED - END');
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
