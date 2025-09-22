import { db } from "@/db/connection";
import { sql, eq, and, or, like, lte, gte } from "drizzle-orm";
import {
  assets,
  assetMovement,
  restockLog,
  users,
  locations,
  type Asset,
  type NewAssetMovement,
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

interface UpdateBulkAssetInput {
  quantity?: number;
  minimumThreshold?: number;
  modelNumber?: string;
  keeperPayrollNumber?: string;
  locationId?: number;
  notes?: string;
}

// Add filter types for bulk assets
export type BulkAssetFilters = {
  bulkStatus?: "active" | "out_of_stock" | "discontinued";
  locationId?: number;
  keeperPayrollNumber?: string;
  search?: string;
  lowStock?: boolean; // Filter for items at or below minimum threshold
  outOfStock?: boolean; // Filter for items with 0 stock
};

// Extend Asset type with location and keeper info
export interface BulkAssetWithDetails extends Asset {
  keeperName: string | null;
  location?: {
    locationId: number;
    regionName: string;
    departmentName: string | null;
    notes: string | null;
  };
}

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
        const movementData: NewAssetMovement = {
          assetId: asset.assetId,
          fromLocationId: null,
          toLocationId: locationId,
          movedBy: keeperPayrollNumber,
          movementType: "adjustment",
          quantity: quantity,
          notes: `Initial stock: ${quantity} units. ${notes}`,
        };

        await tx.insert(assetMovement).values(movementData);

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
   * Update bulk asset by ID
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
        keeperPayrollNumber: assets.keeperPayrollNumber,
      })
      .from(assets)
      .where(eq(assets.assetId, assetId))
      .limit(1);

    if (!assetResult.length || !assetResult[0].isBulk) {
      throw new Error("Bulk asset not found or not a bulk asset.");
    }

    const currentStock = assetResult[0].currentStockLevel ?? 0;
    const currentLocationId = assetResult[0].locationId;
    const currentKeeperPayrollNumber = assetResult[0].keeperPayrollNumber;

    const updates: any = { updatedAt: new Date() };

    // Validate new keeper if provided
    if (data.keeperPayrollNumber !== undefined) {
      if (data.keeperPayrollNumber !== null && data.keeperPayrollNumber !== "") {
        const keeperExists = await db
          .select({ payrollNumber: users.payrollNumber })
          .from(users)
          .where(eq(users.payrollNumber, data.keeperPayrollNumber))
          .limit(1);

        if (!keeperExists.length) {
          throw new Error(`Keeper with payroll number ${data.keeperPayrollNumber} not found`);
        }
      }
      updates.keeperPayrollNumber = data.keeperPayrollNumber || null;
    }

    // Validate new location if provided
    if (data.locationId !== undefined) {
      const locationExists = await db
        .select({ locationId: locations.locationId })
        .from(locations)
        .where(eq(locations.locationId, data.locationId))
        .limit(1);

      if (!locationExists.length) {
        throw new Error(`Location with ID ${data.locationId} not found`);
      }
      updates.locationId = data.locationId;
    }

    // Handle quantity updates
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

      // Log quantity adjustment if changed
      if (data.quantity !== undefined && data.quantity !== currentStock) {
        const change = data.quantity - currentStock;
        await tx.insert(assetMovement).values({
          assetId: assetId,
          fromLocationId: change < 0 ? (data.locationId || currentLocationId) : null,
          toLocationId: change > 0 ? (data.locationId || currentLocationId) : null,
          movedBy: updatedBy,
          movementType: "adjustment",
          quantity: Math.abs(change),
          notes:
            change > 0
              ? `Restocked: +${change} units. ${data.notes || ""}`
              : `Consumed: -${Math.abs(change)} units. ${data.notes || ""}`,
        });
      }

      // Log location transfer if location changed
      if (data.locationId !== undefined && data.locationId !== currentLocationId) {
        await tx.insert(assetMovement).values({
          assetId: assetId,
          fromLocationId: currentLocationId,
          toLocationId: data.locationId,
          movedBy: updatedBy,
          movementType: "transfer",
          quantity: updated.currentStockLevel || 0, // Transfer all current stock
          notes: `Asset transferred to new location. ${data.notes || ""}`,
        });
      }

      // Log keeper assignment change (optional - you might want to track this)
      if (data.keeperPayrollNumber !== undefined && 
          data.keeperPayrollNumber !== currentKeeperPayrollNumber) {
        
        const keeperChangeNote = currentKeeperPayrollNumber 
          ? `Keeper changed from ${currentKeeperPayrollNumber} to ${data.keeperPayrollNumber || 'unassigned'}`
          : `Keeper assigned: ${data.keeperPayrollNumber || 'unassigned'}`;

        // You could create a separate keeper assignment log table, or add to asset movement
        await tx.insert(assetMovement).values({
          assetId: assetId,
          fromLocationId: updated.locationId,
          toLocationId: updated.locationId, // Same location, just keeper change
          movedBy: updatedBy,
          movementType: "assignment", // Make sure this enum value exists
          quantity: 0, // No physical movement of stock
          notes: `${keeperChangeNote}. ${data.notes || ""}`,
        });
      }

      return updated;
    });
  }

  /**
   * Get paginated bulk assets with filters and details
   */
  static async getPaginatedBulkAssets(
    page: number,
    limit: number,
    filters?: BulkAssetFilters,
  ): Promise<{ data: BulkAssetWithDetails[]; total: number }> {
    const offset = (Math.max(page, 1) - 1) * Math.min(limit, 100);
    const conditions = [eq(assets.isBulk, true)];

    // Add filters
    if (filters?.bulkStatus) {
      conditions.push(eq(assets.bulkStatus, filters.bulkStatus));
    }
    if (filters?.locationId) {
      conditions.push(eq(assets.locationId, filters.locationId));
    }
    if (filters?.keeperPayrollNumber) {
      conditions.push(
        eq(assets.keeperPayrollNumber, filters.keeperPayrollNumber),
      );
    }

    // Special stock-based filters
    if (filters?.outOfStock) {
      conditions.push(eq(assets.currentStockLevel, 0));
    }
    if (filters?.lowStock && !filters?.outOfStock) {
      // Items at or below minimum threshold but not out of stock
      conditions.push(
        and(
          lte(assets.currentStockLevel, assets.minimumThreshold),
          gte(assets.currentStockLevel, 1)
        )
      );
    }

    // Add search conditions
    if (filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`LOWER(${assets.name})`, searchTerm),
          like(sql`LOWER(${assets.modelNumber})`, searchTerm),
          like(sql`LOWER(${assets.keeperPayrollNumber})`, searchTerm),
          like(sql`LOWER(${assets.notes})`, searchTerm),
          // Also search by user names
          like(sql`LOWER(${users.firstName})`, searchTerm),
          like(sql`LOWER(${users.lastName})`, searchTerm),
          // Search by location details
          like(sql`LOWER(${locations.regionName})`, searchTerm),
          like(sql`LOWER(${locations.departmentName})`, searchTerm),
        ),
      );
    }

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0] || undefined;

    // Fetch assets with location and user details using JOINs
    const baseQuery = db
      .select({
        // Asset fields
        assetId: assets.assetId,
        name: assets.name,
        keeperPayrollNumber: assets.keeperPayrollNumber,
        locationId: assets.locationId,
        serialNumber: assets.serialNumber,
        isBulk: assets.isBulk,
        individualStatus: assets.individualStatus,
        bulkStatus: assets.bulkStatus,
        currentStockLevel: assets.currentStockLevel,
        minimumThreshold: assets.minimumThreshold,
        lastRestocked: assets.lastRestocked,
        modelNumber: assets.modelNumber,
        notes: assets.notes,
        createdAt: assets.createdAt,
        updatedAt: assets.updatedAt,
        // Location fields
        locationRegionName: locations.regionName,
        locationDepartmentName: locations.departmentName,
        locationNotes: locations.notes,
        // User fields
        keeperFirstName: users.firstName,
        keeperLastName: users.lastName,
      })
      .from(assets)
      .leftJoin(locations, eq(assets.locationId, locations.locationId))
      .leftJoin(users, eq(assets.keeperPayrollNumber, users.payrollNumber));

    const data = whereClause
      ? await baseQuery
          .where(whereClause)
          .limit(Math.min(limit, 100))
          .offset(offset)
          .orderBy(assets.createdAt)
      : await baseQuery
          .limit(Math.min(limit, 100))
          .offset(offset)
          .orderBy(assets.createdAt);

    // Transform the data to include location object and keeper name
    const transformedData: BulkAssetWithDetails[] = data.map((row) => ({
      assetId: row.assetId,
      name: row.name,
      keeperPayrollNumber: row.keeperPayrollNumber,
      locationId: row.locationId,
      serialNumber: row.serialNumber,
      isBulk: row.isBulk,
      individualStatus: row.individualStatus,
      bulkStatus: row.bulkStatus,
      currentStockLevel: row.currentStockLevel,
      minimumThreshold: row.minimumThreshold,
      lastRestocked: row.lastRestocked,
      modelNumber: row.modelNumber,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      // Add keeper name field
      keeperName:
        row.keeperFirstName && row.keeperLastName
          ? `${row.keeperFirstName} ${row.keeperLastName}`
          : null,
      location: row.locationRegionName
        ? {
            locationId: row.locationId,
            regionName: row.locationRegionName,
            departmentName: row.locationDepartmentName,
            notes: row.locationNotes,
          }
        : undefined,
    }));

    // Get total count with same filters and joins
    const baseCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .leftJoin(locations, eq(assets.locationId, locations.locationId))
      .leftJoin(users, eq(assets.keeperPayrollNumber, users.payrollNumber));

    const [{ count }] = whereClause
      ? await baseCountQuery.where(whereClause)
      : await baseCountQuery;

    return { data: transformedData, total: count };
  }

  /**
   * Get all bulk assets with pagination (kept for backwards compatibility)
   */
  static async getAllBulkAssets(page = 1, limit = 10) {
    return await this.getPaginatedBulkAssets(page, limit);
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