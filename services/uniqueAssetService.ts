import { db } from "@/db/connection";
import { sql, eq, and, ne, or, like } from "drizzle-orm";
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
  locationId?: number;
  notes?: string | null;
};

export type UniqueAssetFilters = {
  status?: "in_use" | "not_in_use" | "retired";
  locationId?: number;
  keeperPayrollNumber?: string;
  search?: string;
};

// Properly extend the inferred Asset type
export interface AssetWithLocation extends Asset {
  keeperName: string | null;
  location?: {
    locationId: number;
    regionName: string;
    departmentName: string | null
    notes: string | null;
  };
}

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
    if (data.locationId !== undefined) {
      updates.locationId = data.locationId;
    }
    if (data.notes !== undefined) {
      updates.notes = data.notes;
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
    const [asset] = await db
      .insert(assets)
      .values(data as NewAsset)
      .returning();

    return asset;
  }

  /**
   * Update unique asset
   */
  static async updateUniqueAsset(
    assetId: number,
    updates: {
      name?: string;
      serialNumber?: string;
      modelNumber?: string | null;
      individualStatus?: "in_use" | "not_in_use" | "retired";
      keeperPayrollNumber?: string | null;
      locationId?: number;
      notes?: string | null;
    },
    updatedBy: string
  ): Promise<Asset> {
  // Add this debug logging at the very beginning
  console.log('🔍 SERVICE ENTRY: Raw parameters received:');
  console.log('🔍 SERVICE ENTRY: assetId type:', typeof assetId, 'value:', assetId);
  console.log('🔍 SERVICE ENTRY: updates type:', typeof updates, 'value:', updates);
  console.log('🔍 SERVICE ENTRY: updatedBy type:', typeof updatedBy, 'value:', updatedBy);
  
  console.log('🔍 SERVICE ENTRY: updates object keys:', Object.keys(updates));
  console.log('🔍 SERVICE ENTRY: updates.locationId:', updates.locationId);
  console.log('🔍 SERVICE ENTRY: updates.notes:', updates.notes);
  
  // Check if there's some other method being called instead
  console.log('🔍 SERVICE ENTRY: Method name:', 'updateUniqueAsset');
  console.log('🔍 SERVICE ENTRY: Stack trace:', new Error().stack);
    console.log('🔍 SERVICE: updateUniqueAsset CALLED');
    console.log('🔍 SERVICE PARAMS:', {
      assetId,
      updates: JSON.stringify(updates, null, 2),
      updatedBy
    });
    
    // Get the current asset to check for location changes
    console.log('🔍 SERVICE: Fetching current asset...');
    const currentAsset = await db
      .select()
      .from(assets)
      .where(eq(assets.assetId, assetId))
      .limit(1);

    console.log('🔍 SERVICE: Current asset query result:', currentAsset.length ? 'FOUND' : 'NOT FOUND');
    
    if (!currentAsset.length) {
      console.log('❌ SERVICE: Asset not found for ID:', assetId);
      throw new Error("Asset not found");
    }

    console.log('🔍 SERVICE: Current asset data:', JSON.stringify(currentAsset[0], null, 2));
    
    // Build the update object for the database
    const dbUpdates: Partial<Asset> = {
      updatedAt: new Date()
    };

    console.log('🔍 SERVICE: Building database updates...');
    
    // Map all fields explicitly with logging
    if (updates.name !== undefined) {
      dbUpdates.name = updates.name;
      console.log('🔍 SERVICE: Mapping name:', updates.name);
    }
    
    if (updates.serialNumber !== undefined) {
      dbUpdates.serialNumber = updates.serialNumber;
      console.log('🔍 SERVICE: Mapping serialNumber:', updates.serialNumber);
    }
    
    if (updates.modelNumber !== undefined) {
      dbUpdates.modelNumber = updates.modelNumber;
      console.log('🔍 SERVICE: Mapping modelNumber:', updates.modelNumber);
    }
    
    if (updates.individualStatus !== undefined) {
      dbUpdates.individualStatus = updates.individualStatus;
      console.log('🔍 SERVICE: Mapping individualStatus:', updates.individualStatus);
    }
    
    if (updates.keeperPayrollNumber !== undefined) {
      dbUpdates.keeperPayrollNumber = updates.keeperPayrollNumber;
      console.log('🔍 SERVICE: Mapping keeperPayrollNumber:', updates.keeperPayrollNumber);
    }
    
    // CRITICAL: Make sure these are included
    if (updates.locationId !== undefined) {
      console.log('🔍 SERVICE: Mapping locationId:', updates.locationId);
      dbUpdates.locationId = updates.locationId;
    }
    
    if (updates.notes !== undefined) {
      console.log('🔍 SERVICE: Mapping notes:', updates.notes);
      dbUpdates.notes = updates.notes;
    }
    
    console.log('🔍 SERVICE: Final DB updates object:', JSON.stringify(dbUpdates, null, 2));
    
    // Update the asset
    console.log('🔍 SERVICE: Executing database update...');
    const [updatedAsset] = await db
      .update(assets)
      .set(dbUpdates)
      .where(eq(assets.assetId, assetId))
      .returning();

    console.log('🔍 SERVICE: Database update completed');
    console.log('🔍 SERVICE: Returned updated asset:', JSON.stringify(updatedAsset, null, 2));

    // Handle location change tracking if locationId changed
    if (updates.locationId !== undefined && updates.locationId !== currentAsset[0].locationId) {
      console.log('🔍 SERVICE: Location changed detected, creating movement record...');
      console.log('🔍 SERVICE: Location change - from:', currentAsset[0].locationId, 'to:', updates.locationId);
      
      // Create asset movement record
      await db.insert(assetMovement).values({
        assetId: assetId,
        fromLocationId: currentAsset[0].locationId,
        toLocationId: updates.locationId,
        movedBy: updatedBy,
        movementType: "assignment",
        quantity: 1,
        notes: `Asset location changed from ${currentAsset[0].locationId} to ${updates.locationId}`
      });
      
      console.log('✅ SERVICE: Asset movement record created');
    } else {
      console.log('🔍 SERVICE: No location change detected or locationId not updated');
    }

    console.log('✅ SERVICE: updateUniqueAsset completed successfully');
    return updatedAsset;
  }

  /**
   * Delete unique asset and related records
   */
  static async deleteUniqueAsset(
    assetId: number,
  ): Promise<Partial<Asset> | null> {
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
   * Get paginated unique assets with filters and location details
   */
  static async getPaginatedUniqueAssets(
    page: number,
    limit: number,
    filters?: UniqueAssetFilters,
  ): Promise<{ data: AssetWithLocation[]; total: number }> {
    const offset = (Math.max(page, 1) - 1) * Math.min(limit, 100);
    const conditions = [eq(assets.isBulk, false)];

    // Add filters
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

    // Add search conditions
    if (filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`LOWER(${assets.name})`, searchTerm),
          like(sql`LOWER(${assets.serialNumber})`, searchTerm),
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
        // Location fields - updated to match your schema
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
    const transformedData: AssetWithLocation[] = data.map((row) => ({
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
   * Get paginated unique assets with filters, location details, and user information
   */
  static async getPaginatedUniqueAssets(
    page: number,
    limit: number,
    filters?: UniqueAssetFilters,
  ): Promise<{ data: AssetWithLocation[]; total: number }> {
    return await UniqueAssetDataAccess.getPaginatedUniqueAssets(
      page,
      limit,
      filters,
    );
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
        updatedBy
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
  static async deleteUniqueAsset(
    assetId: number,
  ): Promise<Partial<Asset> | null> {
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
