import { db } from "@/db/connection";
import { sql, eq, and } from "drizzle-orm";
import {
  assets,
  assetMovement,
  restockLog,
  users,
  locations,
} from "@/db/schema";

type CreateBulkAssetInput = {
  name: string;
  locationId: number;
  keeperPayrollNumber: string;
  modelNumber?: string | null;
  quantity: number;
  minimumThreshold?: number;
  lastRestocked?: Date | null;
  notes?: string;
};

type UpdateBulkAssetInput = {
  quantity?: number;
  minimumThreshold?: number;
  modelNumber?: string | null;
  notes?: string;
};

export class BulkAssetService {
  /**
   * Create a new bulk (consumable) asset
   */
  static async createBulkAsset(data: CreateBulkAssetInput) {
    const {
      name,
      locationId,
      keeperPayrollNumber,
      modelNumber = null,
      quantity,
      minimumThreshold = 0,
      lastRestocked = null,
      notes = "Initial creation",
    } = data;

    // Validation
    if (quantity < 0) throw new Error("Quantity cannot be negative");
    if (minimumThreshold < 0)
      throw new Error("Minimum threshold cannot be negative");
    if (!name || name.trim() === "") throw new Error("Asset name is required");
    if (!keeperPayrollNumber || keeperPayrollNumber.trim() === "")
      throw new Error("Keeper payroll number is required");
    if (!locationId || isNaN(locationId))
      throw new Error("Valid location ID is required");

    const now = new Date();

    try {
      return await db.transaction(async (tx) => {
        // ✅ 1. Verify keeper exists in `users`
        const [keeper] = await tx
          .select({ payrollNumber: users.payrollNumber })
          .from(users)
          .where(eq(users.payrollNumber, keeperPayrollNumber))
          .limit(1);

        if (!keeper) {
          throw new Error(
            `Keeper with payroll number '${keeperPayrollNumber}' not found in users.`,
          );
        }

        // ✅ 2. Verify location exists
        const [location] = await tx
          .select({ locationId: locations.locationId })
          .from(locations)
          .where(eq(locations.locationId, locationId))
          .limit(1);

        if (!location) {
          throw new Error(`Location with ID '${locationId}' not found.`);
        }

        // Determine bulk status based on quantity
        const bulkStatus = quantity > 0 ? "active" : "out_of_stock";

        // ✅ 3. Insert asset with explicit type casting
        const insertValues = {
          name: String(name).trim(),
          keeperPayrollNumber: String(keeperPayrollNumber).trim(),
          locationId: Number(locationId),
          isBulk: true,
          bulkStatus: bulkStatus as "active" | "out_of_stock" | "discontinued",
          currentStockLevel: Number(quantity),
          minimumThreshold: Number(minimumThreshold),
          lastRestocked: lastRestocked || now,
          ...(modelNumber && modelNumber.trim()
            ? { modelNumber: String(modelNumber).trim() }
            : {}),
        };

        console.log("Inserting asset with values:", insertValues);

        const [asset] = await tx
          .insert(assets)
          .values(insertValues)
          .returning();

        // ✅ 4. Log movement
        await tx.insert(assetMovement).values({
          assetId: asset.assetId,
          toLocationId: locationId,
          movedBy: keeperPayrollNumber,
          movementType: "adjustment" as const,
          quantity: quantity,
          notes: `Initial stock: ${quantity} units. ${notes}`,
        });

        return asset;
      });
    } catch (error: any) {
      console.error("Database error details:", error);

      // Enhanced error reporting
      if (error.message?.includes("violates check constraint")) {
        throw new Error(`Database constraint violation: ${error.message}`);
      }
      if (error.message?.includes("invalid input value for enum")) {
        throw new Error(`Invalid enum value provided: ${error.message}`);
      }
      if (error.message?.includes("violates foreign key constraint")) {
        throw new Error(`Foreign key constraint violation: ${error.message}`);
      }

      throw new Error(
        `Database operation failed: ${error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Get bulk asset by ID
   */
  static async getBulkAssetById(assetId: number) {
    const [asset] = await db
      .select()
      .from(assets)
      .where(and(eq(assets.assetId, assetId), eq(assets.isBulk, true)))
      .limit(1);

    return asset || null;
  }

  /**
   * Update bulk asset (stock, threshold, etc.)
   */
  static async updateBulkAsset(
    assetId: number,
    data: UpdateBulkAssetInput,
    updatedBy: string,
  ) {
    const assetResult = await db
      .select({
        isBulk: assets.isBulk,
        currentStockLevel: assets.currentStockLevel,
        locationId: assets.locationId,
      })
      .from(assets)
      .where(eq(assets.assetId, assetId))
      .limit(1);

    if (!assetResult.length || !assetResult[0].isBulk) {
      throw new Error("Bulk asset not found or not a bulk asset.");
    }

    const currentStock = assetResult[0].currentStockLevel ?? 0;
    const locationId = assetResult[0].locationId;
    const updates: any = { updatedAt: new Date() };

    if (data.quantity !== undefined) {
      if (data.quantity < 0) throw new Error("Quantity cannot be negative");
      updates.currentStockLevel = data.quantity;
      updates.bulkStatus = data.quantity > 0 ? "active" : "out_of_stock";
    }

    if (data.minimumThreshold !== undefined) {
      if (data.minimumThreshold < 0)
        throw new Error("Minimum threshold cannot be negative");
      updates.minimumThreshold = data.minimumThreshold;
    }

    if (data.modelNumber !== undefined) {
      updates.modelNumber = data.modelNumber;
    }

    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(assets)
        .set(updates)
        .where(eq(assets.assetId, assetId))
        .returning();

      // Log adjustment if quantity changed
      if (data.quantity !== undefined && data.quantity !== currentStock) {
        const change = data.quantity - currentStock;
        await tx.insert(assetMovement).values({
          assetId: assetId,
          fromLocationId: change < 0 ? locationId : null,
          toLocationId: change > 0 ? locationId : null,
          movedBy: updatedBy,
          movementType: "adjustment",
          quantity: Math.abs(change),
          notes:
            change > 0
              ? `Restocked: +${change} units. ${data.notes || ""}`
              : `Consumed: -${Math.abs(change)} units. ${data.notes || ""}`,
        });
      }

      return updated;
    });
  }

  /**
   * Get all bulk assets with pagination
   */
  static async getAllBulkAssets(page = 1, limit = 10) {
    const offset = (Math.max(page, 1) - 1) * Math.min(limit, 100);

    const data = await db
      .select()
      .from(assets)
      .where(eq(assets.isBulk, true))
      .limit(Math.min(limit, 100))
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(eq(assets.isBulk, true));

    return {
      page: Math.max(page, 1),
      limit: Math.min(limit, 100),
      total: count,
      totalPages: Math.ceil(count / Math.min(limit, 100)),
      data,
    };
  }

  /**
   * Delete bulk asset
   */
  static async deleteBulkAsset(assetId: number) {
    const asset = await db
      .select({ isBulk: assets.isBulk })
      .from(assets)
      .where(eq(assets.assetId, assetId))
      .limit(1);

    if (!asset.length || !asset[0].isBulk) {
      throw new Error("Bulk asset not found or not a bulk asset");
    }

    return await db.transaction(async (tx) => {
      // Clean up related records
      await tx.delete(assetMovement).where(eq(assetMovement.assetId, assetId));
      await tx.delete(restockLog).where(eq(restockLog.assetId, assetId));

      const [deleted] = await tx
        .delete(assets)
        .where(eq(assets.assetId, assetId))
        .returning({ assetId: assets.assetId });

      return deleted || null;
    });
  }
}
