// src/app/api/dashboard/services.ts
import { db } from "@/db/connection";
import { and, count, eq, isNull, sql, desc } from "drizzle-orm";
import {
  assets,
  users,
  assetAssignment,
  assetMovement,
  locations,
} from "@/db/schema";

export class DashboardService {
  /**
   * Get statistics for unique (ICT) assets
   */
  async getUniqueAssetStats() {
    const [totalUnique] = await db
      .select({ count: count() })
      .from(assets)
      .where(eq(assets.isBulk, false));

    const [assignedUnique] = await db
      .select({ count: count() })
      .from(assets)
      .where(
        and(eq(assets.isBulk, false), eq(assets.individualStatus, "in_use")),
      );

    const [availableUnique] = await db
      .select({ count: count() })
      .from(assets)
      .where(
        and(
          eq(assets.isBulk, false),
          eq(assets.individualStatus, "not_in_use"),
        ),
      );

    return {
      totalUnique: totalUnique.count,
      assignedUnique: assignedUnique.count,
      availableUnique: availableUnique.count,
    };
  }

  /**
   * Get statistics for bulk assets
   */
  async getBulkAssetStats() {
    const [totalBulk] = await db
      .select({
        total: sql<number>`sum(${assets.currentStockLevel})`,
      })
      .from(assets)
      .where(eq(assets.isBulk, true));

    const [lowStock] = await db
      .select({ count: count() })
      .from(assets)
      .where(
        and(
          eq(assets.isBulk, true),
          sql`${assets.currentStockLevel} <= ${assets.minimumThreshold}`,
        ),
      );

    return {
      totalBulk: totalBulk.total || 0,
      lowStockCount: lowStock.count,
    };
  }
  /**
   * Get top asset keepers (users with most assets assigned)
   */
  async getTopAssetKeepers(limit = 3) {
    try {
      const result = await db
        .select({
          payrollNumber: users.payrollNumber,
          firstName: users.firstName,
          lastName: users.lastName,
          assetCount: sql<number>`count(${assets.assetId})`.as("assetCount"),
        })
        .from(users)
        .leftJoin(assets, eq(assets.keeperPayrollNumber, users.payrollNumber))
        .groupBy(users.payrollNumber, users.firstName, users.lastName)
        .orderBy(sql`count(${assets.assetId}) DESC`)
        .limit(limit);

      return result.map((keeper) => ({
        ...keeper,
        assetCount: Number(keeper.assetCount) || 0,
      }));
    } catch (error) {
      console.error("Error fetching top keepers:", error);
      return [];
    }
  }

  /**
   * Get recent asset movements
   */
  async getRecentMovements(limit = 5) {
    try {
      return await db
        .select({
          movementId: assetMovement.movementId,
          assetId: assetMovement.assetId,
          fromLocationId: assetMovement.fromLocationId,
          toLocationId: assetMovement.toLocationId,
          movedBy: assetMovement.movedBy,
          movementType: assetMovement.movementType,
          quantity: assetMovement.quantity,
          timestamp: assetMovement.timestamp,
          notes: assetMovement.notes,
          assetName: assets.name,
          fromDepartment: sql<string>`from_loc.department_name`.as(
            "fromDepartment",
          ),
          toDepartment: sql<string>`to_loc.department_name`.as("toDepartment"),
          moverFirstName: users.firstName,
          moverLastName: users.lastName,
        })
        .from(assetMovement)
        .leftJoin(assets, eq(assetMovement.assetId, assets.assetId))
        .leftJoin(
          sql`${locations} as from_loc`,
          sql`${assetMovement.fromLocationId} = from_loc.location_id`,
        )
        .leftJoin(
          sql`${locations} as to_loc`,
          sql`${assetMovement.toLocationId} = to_loc.location_id`,
        )
        .leftJoin(users, eq(assetMovement.movedBy, users.payrollNumber))
        .orderBy(desc(assetMovement.timestamp))
        .limit(limit);
    } catch (error) {
      console.error("Error fetching recent movements:", error);
      return [];
    }
  }
}
