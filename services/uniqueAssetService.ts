import { db } from "@/db/connection";
import { sql, eq, and, ne } from "drizzle-orm";
import {
  assets,
  assetMovement,
  assetAssignment,
  users,
  locations,
  type Asset,
  type NewAsset,
} from "@/db/schema";

// === TYPES ===
export type CreateUniqueAssetInput = {
  name: string;
  locationId: number;
  keeperPayrollNumber?: string | null;
  serialNumber: string;
  modelNumber?: string | null;
  individualStatus?: "in_use" | "not_in_use" | "retired";
  notes?: string | null;
};

export type UpdateUniqueAssetInput = {
  name?: string;
  keeperPayrollNumber?: string | null;
  serialNumber?: string;
  modelNumber?: string | null;
  individualStatus?: "in_use" | "not_in_use" | "retired";
  notes?: string;
};

export type UniqueAssetFilters = {
  status?: "in_use" | "not_in_use" | "retired";
  locationId?: number;
  keeperPayrollNumber?: string;
};

// === BUSINESS LOGIC LAYER ===
class UniqueAssetBusinessLogic {
  /**
   * Validates input data for creating a unique asset
   */
  static validateCreateInput(data: CreateUniqueAssetInput): void {
    if (!data.name || data.name.trim() === "") {
      throw new Error("Asset name is required");
    }
    if (!data.serialNumber || data.serialNumber.trim() === "") {
      throw new Error("Serial number is required for unique assets");
    }
    if (!data.locationId || isNaN(data.locationId)) {
      throw new Error("Valid location ID is required");
    }
  }

  /**
   * Prepares insert data for unique asset
   */
  static prepareUniqueAssetData(
    data: CreateUniqueAssetInput,
  ): Partial<NewAsset> {
    return {
      name: data.name.trim(),
      locationId: data.locationId,
      keeperPayrollNumber: data.keeperPayrollNumber || null,
      serialNumber: data.serialNumber.trim(), // ✅ Required for unique assets
      isBulk: false, // ✅ MUST be false for unique assets
      individualStatus: data.individualStatus || "not_in_use", // ✅ For unique assets
      modelNumber: data.modelNumber?.trim() || null,
      notes: data.notes || null,

      // ✅ Explicitly set bulk fields to null/0 for unique assets
      bulkStatus: null, // ✅ Must be null for unique assets
      currentStockLevel: null, // ✅ Must be null (NOT NaN!) for unique assets
      minimumThreshold: 0, // ✅ Use 0 to satisfy constraint
      lastRestocked: null, // ✅ Must be null for unique assets
    };
  }

  /**
   * Validates update data
   */
  static validateUpdateInput(data: UpdateUniqueAssetInput): void {
    if (data.name !== undefined && data.name.trim() === "") {
      throw new Error("Asset name cannot be empty");
    }
    if (data.serialNumber !== undefined && data.serialNumber.trim() === "") {
      throw new Error("Serial number cannot be empty");
    }
  }

  /**
   * Prepares update data
   */
  static prepareUpdateData(data: UpdateUniqueAssetInput): Partial<Asset> {
    const updates: Partial<Asset> = { updatedAt: new Date() };

    if (data.name !== undefined) {
      updates.name = data.name.trim();
    }
    if (data.serialNumber !== undefined) {
      updates.serialNumber = data.serialNumber.trim();
    }
    if (data.modelNumber !== undefined) {
      updates.modelNumber = data.modelNumber?.trim() || null;
    }
    if (data.individualStatus !== undefined) {
      updates.individualStatus = data.individualStatus;
    }
    if (data.keeperPayrollNumber !== undefined) {
      updates.keeperPayrollNumber = data.keeperPayrollNumber?.trim() || null;
    }

    return updates;
  }
}

// === DATA ACCESS LAYER ===
class UniqueAssetDataAccess {
  /**
   * Check if location exists
   */
  static async verifyLocationExists(locationId: number): Promise<boolean> {
    const [location] = await db
      .select({ locationId: locations.locationId })
      .from(locations)
      .where(eq(locations.locationId, locationId))
      .limit(1);

    return !!location;
  }

  /**
   * Check if user exists
   */
  static async verifyUserExists(payrollNumber: string): Promise<boolean> {
    const [user] = await db
      .select({ payrollNumber: users.payrollNumber })
      .from(users)
      .where(eq(users.payrollNumber, payrollNumber))
      .limit(1);

    return !!user;
  }

  /**
   * Check if serial number exists (excluding specific asset)
   */
  static async checkSerialNumberExists(
    serialNumber: string,
    excludeAssetId?: number,
  ): Promise<boolean> {
    const conditions = [eq(assets.serialNumber, serialNumber)];

    if (excludeAssetId) {
      conditions.push(ne(assets.assetId, excludeAssetId));
    }

    const [existing] = await db
      .select({ assetId: assets.assetId })
      .from(assets)
      .where(and(...conditions))
      .limit(1);

    return !!existing;
  }

  /**
   * Get unique asset by ID
   */
  static async getUniqueAssetById(assetId: number): Promise<Asset | null> {
    const [asset] = await db
      .select()
      .from(assets)
      .where(and(eq(assets.assetId, assetId), eq(assets.isBulk, false)))
      .limit(1);

    return asset || null;
  }

  /**
   * Insert new unique asset
   */
  static async insertUniqueAsset(data: Partial<NewAsset>): Promise<Asset> {
    const [asset] = await db.insert(assets).values(data).returning();

    return asset;
  }

  /**
   * Update unique asset
   */
  static async updateUniqueAsset(
    assetId: number,
    updates: Partial<Asset>,
  ): Promise<Asset> {
    const [updated] = await db
      .update(assets)
      .set(updates)
      .where(eq(assets.assetId, assetId))
      .returning();

    return updated;
  }

  /**
   * Delete unique asset and related records
   */
  static async deleteUniqueAsset(assetId: number): Promise<Asset | null> {
    return await db.transaction(async (tx) => {
      // Clean up related records
      await tx.delete(assetMovement).where(eq(assetMovement.assetId, assetId));
      await tx
        .delete(assetAssignment)
        .where(eq(assetAssignment.assetId, assetId));

      const [deleted] = await tx
        .delete(assets)
        .where(eq(assets.assetId, assetId))
        .returning({
          assetId: assets.assetId,
          name: assets.name,
          serialNumber: assets.serialNumber,
        });

      return deleted || null;
    });
  }

  /**
   * Log asset movement
   */
  static async logMovement(data: {
    assetId: number;
    fromLocationId?: number | null;
    toLocationId: number;
    movedBy: string;
    movementType: "transfer" | "assignment" | "adjustment" | "disposal";
    notes?: string;
  }): Promise<void> {
    await db.insert(assetMovement).values({
      assetId: data.assetId,
      fromLocationId: data.fromLocationId || null,
      toLocationId: data.toLocationId,
      movedBy: data.movedBy,
      movementType: data.movementType,
      quantity: 1,
      notes: data.notes,
    });
  }

  /**
   * Get paginated unique assets with filters
   */
  static async getPaginatedUniqueAssets(
    page: number,
    limit: number,
    filters?: UniqueAssetFilters,
  ): Promise<{ data: Asset[]; total: number }> {
    const offset = (Math.max(page, 1) - 1) * Math.min(limit, 100);
    const conditions = [eq(assets.isBulk, false)];

    if (filters?.status) {
      conditions.push(eq(assets.individualStatus, filters.status));
    }
    if (filters?.locationId) {
      conditions.push(eq(assets.locationId, filters.locationId));
    }
    if (filters?.keeperPayrollNumber) {
      conditions.push(
        eq(assets.keeperPayrollNumber, filters.keeperPayrollNumber),
      );
    }

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    const data = await db
      .select()
      .from(assets)
      .where(whereClause)
      .limit(Math.min(limit, 100))
      .offset(offset)
      .orderBy(assets.createdAt);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(whereClause);

    return { data, total: count };
  }
}

// === SERVICE LAYER (PUBLIC API) ===
export class UniqueAssetService {
  /**
   * Create a new unique asset
   */
  static async createUniqueAsset(data: CreateUniqueAssetInput): Promise<Asset> {
    // Business logic validation
    UniqueAssetBusinessLogic.validateCreateInput(data);

    try {
      return await db.transaction(async (tx) => {
        // Verify foreign key references
        if (
          !(await UniqueAssetDataAccess.verifyLocationExists(data.locationId))
        ) {
          throw new Error(`Location with ID '${data.locationId}' not found.`);
        }

        if (data.keeperPayrollNumber) {
          if (
            !(await UniqueAssetDataAccess.verifyUserExists(
              data.keeperPayrollNumber,
            ))
          ) {
            throw new Error(
              `Keeper with payroll number '${data.keeperPayrollNumber}' not found.`,
            );
          }
        }

        // Check for duplicate serial number
        if (
          await UniqueAssetDataAccess.checkSerialNumberExists(data.serialNumber)
        ) {
          throw new Error(
            `Asset with serial number '${data.serialNumber}' already exists.`,
          );
        }

        // Prepare and insert asset
        const assetData = UniqueAssetBusinessLogic.prepareUniqueAssetData(data);
        const asset = await UniqueAssetDataAccess.insertUniqueAsset(assetData);

        // Log initial movement
        await UniqueAssetDataAccess.logMovement({
          assetId: asset.assetId,
          toLocationId: data.locationId,
          movedBy: data.keeperPayrollNumber || "SYSTEM",
          movementType: "transfer",
          notes: `Initial asset creation. ${data.notes || ""}`,
        });

        return asset;
      });
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        throw new Error(`Serial number '${data.serialNumber}' already exists`);
      }
      throw new Error(
        `Failed to create asset: ${error.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Get all unique assets with pagination and filtering
   */
  static async getAllUniqueAssets(
    page = 1,
    limit = 10,
    filters?: UniqueAssetFilters,
  ) {
    const { data, total } =
      await UniqueAssetDataAccess.getPaginatedUniqueAssets(
        page,
        limit,
        filters,
      );

    return {
      page: Math.max(page, 1),
      limit: Math.min(limit, 100),
      total,
      totalPages: Math.ceil(total / Math.min(limit, 100)),
      data,
    };
  }

  /**
   * Get unique asset by ID
   */
  static async getUniqueAssetById(assetId: number): Promise<Asset | null> {
    return await UniqueAssetDataAccess.getUniqueAssetById(assetId);
  }

  /**
   * Update unique asset
   */
  static async updateUniqueAsset(
    assetId: number,
    data: UpdateUniqueAssetInput,
    updatedBy: string,
  ): Promise<Asset> {
    // Business logic validation
    UniqueAssetBusinessLogic.validateUpdateInput(data);

    const existingAsset =
      await UniqueAssetDataAccess.getUniqueAssetById(assetId);
    if (!existingAsset) {
      throw new Error("Unique asset not found.");
    }

    return await db.transaction(async (tx) => {
      // Check for duplicate serial number if changing
      if (
        data.serialNumber &&
        data.serialNumber !== existingAsset.serialNumber
      ) {
        if (
          await UniqueAssetDataAccess.checkSerialNumberExists(
            data.serialNumber,
            assetId,
          )
        ) {
          throw new Error(
            `Asset with serial number '${data.serialNumber}' already exists.`,
          );
        }
      }

      // Verify keeper exists if being updated
      if (data.keeperPayrollNumber) {
        if (
          !(await UniqueAssetDataAccess.verifyUserExists(
            data.keeperPayrollNumber,
          ))
        ) {
          throw new Error(
            `Keeper with payroll number '${data.keeperPayrollNumber}' not found.`,
          );
        }
      }

      // Prepare and execute update
      const updates = UniqueAssetBusinessLogic.prepareUpdateData(data);
      const updatedAsset = await UniqueAssetDataAccess.updateUniqueAsset(
        assetId,
        updates,
      );

      // Log keeper change if applicable
      if (data.keeperPayrollNumber !== undefined) {
        await UniqueAssetDataAccess.logMovement({
          assetId: assetId,
          fromLocationId: existingAsset.locationId,
          toLocationId: existingAsset.locationId,
          movedBy: updatedBy,
          movementType: "assignment",
          notes: data.keeperPayrollNumber
            ? `Asset assigned to ${data.keeperPayrollNumber}`
            : "Asset unassigned from keeper",
        });
      }

      return updatedAsset;
    });
  }

  /**
   * Delete unique asset
   */
  static async deleteUniqueAsset(assetId: number): Promise<Asset | null> {
    const asset = await UniqueAssetDataAccess.getUniqueAssetById(assetId);
    if (!asset) {
      throw new Error("Unique asset not found");
    }

    return await UniqueAssetDataAccess.deleteUniqueAsset(assetId);
  }

  /**
   * Transfer unique asset to different location
   */
  static async transferAsset(
    assetId: number,
    toLocationId: number,
    movedBy: string,
    notes?: string,
  ): Promise<Asset> {
    const existingAsset =
      await UniqueAssetDataAccess.getUniqueAssetById(assetId);
    if (!existingAsset) {
      throw new Error("Unique asset not found.");
    }

    if (existingAsset.locationId === toLocationId) {
      throw new Error("Asset is already at this location.");
    }

    return await db.transaction(async (tx) => {
      // Verify destination location exists
      if (!(await UniqueAssetDataAccess.verifyLocationExists(toLocationId))) {
        throw new Error(
          `Destination location with ID '${toLocationId}' not found.`,
        );
      }

      // Update asset location
      const updatedAsset = await UniqueAssetDataAccess.updateUniqueAsset(
        assetId,
        {
          locationId: toLocationId,
          updatedAt: new Date(),
        },
      );

      // Log movement
      await UniqueAssetDataAccess.logMovement({
        assetId: assetId,
        fromLocationId: existingAsset.locationId,
        toLocationId: toLocationId,
        movedBy: movedBy,
        movementType: "transfer",
        notes: notes || `Asset transferred to location ID ${toLocationId}`,
      });

      return updatedAsset;
    });
  }
}
