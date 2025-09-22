import { db } from '@/db/connection';
import { 
  assetMovement, 
  assets, 
  locations, 
  users,
  type AssetMovement 
} from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export interface AssetMovementWithDetails {
  movementId: number;
  assetId: number;
  fromLocationId: number | null;
  toLocationId: number;
  movedBy: string;
  movementType: string;
  quantity: number;
  timestamp: Date;
  notes: string | null;
  fromLocation?: {
    locationId: number;
    regionName: string;
    departmentName: string;
  } | null;
  toLocation: {
    locationId: number;
    regionName: string;
    departmentName: string;
  };
  movedByUser: {
    payrollNumber: string;
    firstName: string;
    lastName: string;
  };
  asset: {
    assetId: number;
    name: string;
    serialNumber?: string | null;
    isBulk: boolean;
  };
}

export class AssetMovementService {
  /**
   * Get all movements for a specific asset (both unique and bulk)
   */
  static async getAssetMovements(assetId: number): Promise<AssetMovementWithDetails[]> {
    try {
      // Get basic movement data
      const movements = await db
        .select()
        .from(assetMovement)
        .where(eq(assetMovement.assetId, assetId))
        .orderBy(desc(assetMovement.timestamp));

      if (movements.length === 0) {
        return [];
      }

      // Get asset details
      const asset = await db
        .select({
          assetId: assets.assetId,
          name: assets.name,
          serialNumber: assets.serialNumber,
          isBulk: assets.isBulk,
        })
        .from(assets)
        .where(eq(assets.assetId, assetId))
        .limit(1);

      if (!asset[0]) {
        throw new Error('Asset not found');
      }

      // Get all unique location IDs and user payroll numbers
      const locationIds = new Set<number>();
      const userPayrollNumbers = new Set<string>();

      movements.forEach(movement => {
        if (movement.fromLocationId) locationIds.add(movement.fromLocationId);
        locationIds.add(movement.toLocationId);
        userPayrollNumbers.add(movement.movedBy);
      });

      // Fetch all locations and users in batch
      const [locationsData, usersData] = await Promise.all([
        db
          .select()
          .from(locations)
          .where(eq(locations.locationId, Array.from(locationIds)[0])) // We'll handle this differently
          .then(async () => {
            // Get all locations that we need
            const locationPromises = Array.from(locationIds).map(id =>
              db.select().from(locations).where(eq(locations.locationId, id)).limit(1)
            );
            const locationResults = await Promise.all(locationPromises);
            return locationResults.map(result => result[0]).filter(Boolean);
          }),
        db
          .select()
          .from(users)
          .then(async () => {
            // Get all users that we need
            const userPromises = Array.from(userPayrollNumbers).map(payroll =>
              db.select().from(users).where(eq(users.payrollNumber, payroll)).limit(1)
            );
            const userResults = await Promise.all(userPromises);
            return userResults.map(result => result[0]).filter(Boolean);
          })
      ]);

      // Create lookup maps
      const locationMap = new Map(locationsData.map(loc => [loc.locationId, loc]));
      const userMap = new Map(usersData.map(user => [user.payrollNumber, user]));

      // Combine the data
      return movements.map(movement => {
        const fromLocation = movement.fromLocationId ? locationMap.get(movement.fromLocationId) : null;
        const toLocation = locationMap.get(movement.toLocationId);
        const movedByUser = userMap.get(movement.movedBy);

        if (!toLocation || !movedByUser) {
          throw new Error('Missing required location or user data');
        }

        return {
          movementId: movement.movementId,
          assetId: movement.assetId,
          fromLocationId: movement.fromLocationId,
          toLocationId: movement.toLocationId,
          movedBy: movement.movedBy,
          movementType: movement.movementType,
          quantity: movement.quantity,
          timestamp: movement.timestamp,
          notes: movement.notes,
          fromLocation: fromLocation ? {
            locationId: fromLocation.locationId,
            regionName: fromLocation.regionName,
            departmentName: fromLocation.departmentName,
          } : null,
          toLocation: {
            locationId: toLocation.locationId,
            regionName: toLocation.regionName,
            departmentName: toLocation.departmentName,
          },
          movedByUser: {
            payrollNumber: movedByUser.payrollNumber,
            firstName: movedByUser.firstName,
            lastName: movedByUser.lastName,
          },
          asset: asset[0],
        };
      });
    } catch (error) {
      console.error('Error fetching asset movements:', error);
      throw new Error('Failed to fetch asset movements');
    }
  }

  /**
   * Get movements for unique assets only
   */
  static async getUniqueAssetMovements(assetId: number): Promise<AssetMovementWithDetails[]> {
    // First check if asset is unique
    const asset = await db
      .select({ isBulk: assets.isBulk })
      .from(assets)
      .where(eq(assets.assetId, assetId))
      .limit(1);

    if (!asset[0] || asset[0].isBulk) {
      return []; // Return empty array if asset is bulk or doesn't exist
    }

    return this.getAssetMovements(assetId);
  }

  /**
   * Get movements for bulk assets only
   */
  static async getBulkAssetMovements(assetId: number): Promise<AssetMovementWithDetails[]> {
    // First check if asset is bulk
    const asset = await db
      .select({ isBulk: assets.isBulk })
      .from(assets)
      .where(eq(assets.assetId, assetId))
      .limit(1);

    if (!asset[0] || !asset[0].isBulk) {
      return []; // Return empty array if asset is unique or doesn't exist
    }

    return this.getAssetMovements(assetId);
  }
}