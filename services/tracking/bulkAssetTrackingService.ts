// services/tracking/bulkAssetTrackingService.ts
import { db } from "@/db/connection";
import { assets, locations, users, restockLog, assetMovement, assetAssignment } from "@/db/schema";
import { eq, and, desc, sum, count, or, ilike } from "drizzle-orm";

export class BulkAssetService {
  /**
   * Get detailed information for a single bulk asset
   * @param assetId - The ID of the bulk asset
   * @returns Detailed asset information with tracking data
   */
  static async getBulkAssetById(assetId: number) {
    try {
      // First, get the basic asset information with relations
      const asset = await db
        .select({
          assetId: assets.assetId,
          name: assets.name,
          isBulk: assets.isBulk,
          bulkStatus: assets.bulkStatus,
          currentStockLevel: assets.currentStockLevel,
          minimumThreshold: assets.minimumThreshold,
          lastRestocked: assets.lastRestocked,
          modelNumber: assets.modelNumber,
          notes: assets.notes,
          createdAt: assets.createdAt,
          updatedAt: assets.updatedAt,
          // Location details
          locationId: locations.locationId,
          regionName: locations.regionName,
          departmentName: locations.departmentName,
          locationNotes: locations.notes,
          // Keeper details
          keeperPayrollNumber: users.payrollNumber,
          keeperFirstName: users.firstName,
          keeperLastName: users.lastName,
        })
        .from(assets)
        .leftJoin(locations, eq(assets.locationId, locations.locationId))
        .leftJoin(users, eq(assets.keeperPayrollNumber, users.payrollNumber))
        .where(and(
          eq(assets.assetId, assetId),
          eq(assets.isBulk, true)
        ))
        .limit(1);

      if (!asset || asset.length === 0) {
        throw new Error("Asset not found or is not a bulk asset");
      }

      const assetData = asset[0];

      // Get total quantity restocked (sum of all restock events)
      const totalRestockedResult = await db
        .select({
          total: sum(restockLog.quantityRestocked)
        })
        .from(restockLog)
        .where(eq(restockLog.assetId, assetId));

      const totalQuantityRestocked = Number(totalRestockedResult[0]?.total || 0);

      // Get recent restock history (last 10 restock events)
      const recentRestocks = await db
        .select({
          logId: restockLog.logId,
          quantityRestocked: restockLog.quantityRestocked,
          timestamp: restockLog.timestamp,
          notes: restockLog.notes,
          restockerPayrollNumber: users.payrollNumber,
          restockerFirstName: users.firstName,
          restockerLastName: users.lastName,
        })
        .from(restockLog)
        .leftJoin(users, eq(restockLog.restockedBy, users.payrollNumber))
        .where(eq(restockLog.assetId, assetId))
        .orderBy(desc(restockLog.timestamp))
        .limit(10);

      // Get recent movements (last 10 movement events)
      const recentMovements = await db
        .select({
          movementId: assetMovement.movementId,
          movementType: assetMovement.movementType,
          quantity: assetMovement.quantity,
          timestamp: assetMovement.timestamp,
          notes: assetMovement.notes,
          fromLocationId: assetMovement.fromLocationId,
          toLocationId: assetMovement.toLocationId,
          movedByPayrollNumber: users.payrollNumber,
          movedByFirstName: users.firstName,
          movedByLastName: users.lastName,
        })
        .from(assetMovement)
        .leftJoin(users, eq(assetMovement.movedBy, users.payrollNumber))
        .where(eq(assetMovement.assetId, assetId))
        .orderBy(desc(assetMovement.timestamp))
        .limit(10);

      // Get recent assignments (last 10 assignment events)
      const recentAssignments = await db
        .select({
          assignmentId: assetAssignment.assignmentId,
          quantity: assetAssignment.quantity,
          dateIssued: assetAssignment.dateIssued,
          dateReturned: assetAssignment.dateReturned,
          conditionIssued: assetAssignment.conditionIssued,
          conditionReturned: assetAssignment.conditionReturned,
          quantityReturned: assetAssignment.quantityReturned,
          notes: assetAssignment.notes,
          assignedToPayrollNumber: assetAssignment.assignedTo,
          assignedByPayrollNumber: assetAssignment.assignedBy,
        })
        .from(assetAssignment)
        .where(eq(assetAssignment.assetId, assetId))
        .orderBy(desc(assetAssignment.dateIssued))
        .limit(10);

      // Calculate additional metrics
      const isLowStock = (assetData.currentStockLevel || 0) <= (assetData.minimumThreshold || 0);
      const stockPercentage = assetData.minimumThreshold 
        ? Math.round(((assetData.currentStockLevel || 0) / assetData.minimumThreshold) * 100)
        : null;

      // Return comprehensive asset data
      return {
        // Basic asset information
        assetId: assetData.assetId,
        name: assetData.name,
        isBulk: assetData.isBulk,
        bulkStatus: assetData.bulkStatus,
        currentStockLevel: assetData.currentStockLevel,
        minimumThreshold: assetData.minimumThreshold,
        lastRestocked: assetData.lastRestocked,
        modelNumber: assetData.modelNumber,
        notes: assetData.notes,
        createdAt: assetData.createdAt,
        updatedAt: assetData.updatedAt,

        // Location information
        location: {
          locationId: assetData.locationId,
          regionName: assetData.regionName,
          departmentName: assetData.departmentName,
          notes: assetData.locationNotes,
        },

        // Keeper information
        keeper: assetData.keeperPayrollNumber ? {
          payrollNumber: assetData.keeperPayrollNumber,
          firstName: assetData.keeperFirstName,
          lastName: assetData.keeperLastName,
          fullName: `${assetData.keeperFirstName} ${assetData.keeperLastName}`,
        } : null,

        // Stock metrics
        stockMetrics: {
          isLowStock,
          stockPercentage,
          totalQuantityRestocked,
          restockCount: recentRestocks.length,
        },

        // Historical data
        recentRestocks: recentRestocks.map(restock => ({
          ...restock,
          restocker: restock.restockerPayrollNumber ? {
            payrollNumber: restock.restockerPayrollNumber,
            firstName: restock.restockerFirstName,
            lastName: restock.restockerLastName,
            fullName: `${restock.restockerFirstName} ${restock.restockerLastName}`,
          } : null,
        })),

        recentMovements: recentMovements.map(movement => ({
          ...movement,
          movedBy: movement.movedByPayrollNumber ? {
            payrollNumber: movement.movedByPayrollNumber,
            firstName: movement.movedByFirstName,
            lastName: movement.movedByLastName,
            fullName: `${movement.movedByFirstName} ${movement.movedByLastName}`,
          } : null,
        })),

        recentAssignments: recentAssignments.map(assignment => ({
          ...assignment,
          isActive: !assignment.dateReturned,
          quantityOutstanding: (assignment.quantity || 0) - (assignment.quantityReturned || 0),
        })),
      };

    } catch (error) {
      console.error("Error in getBulkAssetById:", error);
      throw error;
    }
  }

  /**
   * Get complete restock history for a bulk asset
   * @param assetId - The ID of the bulk asset
   * @returns Asset details with complete restock history
   */
  static async getBulkAssetRestockHistory(assetId: number) {
    try {
      // First, verify the asset exists and is a bulk asset
      const asset = await db
        .select({
          assetId: assets.assetId,
          name: assets.name,
          isBulk: assets.isBulk,
          bulkStatus: assets.bulkStatus,
          currentStockLevel: assets.currentStockLevel,
          minimumThreshold: assets.minimumThreshold,
          lastRestocked: assets.lastRestocked,
          modelNumber: assets.modelNumber,
          notes: assets.notes,
          // Location details
          locationId: locations.locationId,
          regionName: locations.regionName,
          departmentName: locations.departmentName,
          // Keeper details
          keeperPayrollNumber: users.payrollNumber,
          keeperFirstName: users.firstName,
          keeperLastName: users.lastName,
        })
        .from(assets)
        .leftJoin(locations, eq(assets.locationId, locations.locationId))
        .leftJoin(users, eq(assets.keeperPayrollNumber, users.payrollNumber))
        .where(and(
          eq(assets.assetId, assetId),
          eq(assets.isBulk, true)
        ))
        .limit(1);

      if (!asset || asset.length === 0) {
        throw new Error("Asset not found or is not a bulk asset");
      }

      const assetData = asset[0];

      // Get complete restock history (ordered by most recent first)
      const restockHistory = await db
        .select({
          logId: restockLog.logId,
          quantityRestocked: restockLog.quantityRestocked,
          timestamp: restockLog.timestamp,
          notes: restockLog.notes,
          // Restocker details
          restockerPayrollNumber: users.payrollNumber,
          restockerFirstName: users.firstName,
          restockerLastName: users.lastName,
          restockerRole: users.role,
        })
        .from(restockLog)
        .leftJoin(users, eq(restockLog.restockedBy, users.payrollNumber))
        .where(eq(restockLog.assetId, assetId))
        .orderBy(desc(restockLog.timestamp));

      return {
        asset: {
          assetId: assetData.assetId,
          name: assetData.name,
          isBulk: assetData.isBulk,
          bulkStatus: assetData.bulkStatus,
          currentStockLevel: assetData.currentStockLevel,
          minimumThreshold: assetData.minimumThreshold,
          lastRestocked: assetData.lastRestocked,
          modelNumber: assetData.modelNumber,
          notes: assetData.notes,
          location: {
            locationId: assetData.locationId,
            regionName: assetData.regionName,
            departmentName: assetData.departmentName,
          },
          keeper: assetData.keeperPayrollNumber ? {
            payrollNumber: assetData.keeperPayrollNumber,
            firstName: assetData.keeperFirstName,
            lastName: assetData.keeperLastName,
            fullName: `${assetData.keeperFirstName} ${assetData.keeperLastName}`,
          } : null,
        },
        restockHistory: restockHistory.map(restock => ({
          logId: restock.logId,
          quantityRestocked: restock.quantityRestocked,
          timestamp: restock.timestamp,
          notes: restock.notes,
          restocker: restock.restockerPayrollNumber ? {
            payrollNumber: restock.restockerPayrollNumber,
            firstName: restock.restockerFirstName,
            lastName: restock.restockerLastName,
            fullName: `${restock.restockerFirstName} ${restock.restockerLastName}`,
            role: restock.restockerRole,
          } : null,
        })),
      };

    } catch (error) {
      console.error("Error in getBulkAssetRestockHistory:", error);
      throw error;
    }
  }

  /**
   * Get all tracked bulk assets with pagination and filtering
   * @param options - Pagination and filtering options
   * @returns Paginated list of bulk assets with tracking information
   */
  static async getTrackedBulkAssets(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "active" | "out_of_stock" | "discontinued";
    locationId?: number;
    lowStockOnly?: boolean;
  } = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        status,
        locationId,
        lowStockOnly = false
      } = options;

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build where conditions array
      const whereConditions = [eq(assets.isBulk, true)];
      
      // Add search condition (search in asset name and model number)
      if (search.trim()) {
        whereConditions.push(
          or(
            ilike(assets.name, `%${search.trim()}%`),
            ilike(assets.modelNumber, `%${search.trim()}%`)
          )
        );
      }
      
      // Add status filter
      if (status) {
        whereConditions.push(eq(assets.bulkStatus, status));
      }
      
      // Add location filter
      if (locationId) {
        whereConditions.push(eq(assets.locationId, locationId));
      }

      // Combine all where conditions
      const combinedWhereCondition = whereConditions.length > 1 
        ? and(...whereConditions) 
        : whereConditions[0];

      // Get paginated results
      const paginatedAssets = await db
        .select({
          assetId: assets.assetId,
          name: assets.name,
          isBulk: assets.isBulk,
          bulkStatus: assets.bulkStatus,
          currentStockLevel: assets.currentStockLevel,
          minimumThreshold: assets.minimumThreshold,
          lastRestocked: assets.lastRestocked,
          modelNumber: assets.modelNumber,
          notes: assets.notes,
          createdAt: assets.createdAt,
          updatedAt: assets.updatedAt,
          // Location details
          locationId: locations.locationId,
          regionName: locations.regionName,
          departmentName: locations.departmentName,
          locationNotes: locations.notes,
          // Keeper details
          keeperPayrollNumber: users.payrollNumber,
          keeperFirstName: users.firstName,
          keeperLastName: users.lastName,
        })
        .from(assets)
        .leftJoin(locations, eq(assets.locationId, locations.locationId))
        .leftJoin(users, eq(assets.keeperPayrollNumber, users.payrollNumber))
        .where(combinedWhereCondition)
        .orderBy(desc(assets.updatedAt))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const totalCountResult = await db
        .select({ count: count() })
        .from(assets)
        .leftJoin(locations, eq(assets.locationId, locations.locationId))
        .where(combinedWhereCondition);

      const totalCount = totalCountResult[0]?.count || 0;

      // For each asset, get additional tracking information
      const assetsWithTracking = await Promise.all(
        paginatedAssets.map(async (asset) => {
          // Get total quantity restocked and restock events count
          const totalRestockedResult = await db
            .select({
              total: sum(restockLog.quantityRestocked),
              count: count(restockLog.logId)
            })
            .from(restockLog)
            .where(eq(restockLog.assetId, asset.assetId));

          // FIXED: Properly declare variables before using them
          const totalQuantityRestocked = Number(totalRestockedResult[0]?.total || 0);
          const totalRestockEvents = Number(totalRestockedResult[0]?.count || 0);

          // Get most recent restock
          const recentRestock = await db
            .select({
              timestamp: restockLog.timestamp,
              quantityRestocked: restockLog.quantityRestocked,
              restockerPayrollNumber: users.payrollNumber,
              restockerFirstName: users.firstName,
              restockerLastName: users.lastName,
            })
            .from(restockLog)
            .leftJoin(users, eq(restockLog.restockedBy, users.payrollNumber))
            .where(eq(restockLog.assetId, asset.assetId))
            .orderBy(desc(restockLog.timestamp))
            .limit(1);

          // Calculate stock metrics
          const isLowStock = (asset.currentStockLevel || 0) <= (asset.minimumThreshold || 0);
          const stockPercentage = asset.minimumThreshold 
            ? Math.round(((asset.currentStockLevel || 0) / asset.minimumThreshold) * 100)
            : null;

          return {
            // Basic asset information
            assetId: asset.assetId,
            name: asset.name,
            isBulk: asset.isBulk,
            bulkStatus: asset.bulkStatus,
            currentStockLevel: asset.currentStockLevel,
            minimumThreshold: asset.minimumThreshold,
            lastRestocked: asset.lastRestocked,
            modelNumber: asset.modelNumber,
            notes: asset.notes,
            createdAt: asset.createdAt,
            updatedAt: asset.updatedAt,

            // Location information
            location: {
              locationId: asset.locationId,
              regionName: asset.regionName,
              departmentName: asset.departmentName,
              notes: asset.locationNotes,
            },

            // Keeper information
            keeper: asset.keeperPayrollNumber ? {
              payrollNumber: asset.keeperPayrollNumber,
              firstName: asset.keeperFirstName,
              lastName: asset.keeperLastName,
              fullName: `${asset.keeperFirstName} ${asset.keeperLastName}`,
            } : null,

            // Stock metrics - FIXED: Using properly declared variables
            stockMetrics: {
              isLowStock,
              stockPercentage,
              totalQuantityRestocked,
              totalRestockEvents,
              averageRestockQuantity: totalRestockEvents > 0 
                ? Math.round(totalQuantityRestocked / totalRestockEvents)
                : 0,
            },

            // Most recent restock
            mostRecentRestock: recentRestock.length > 0 ? {
              timestamp: recentRestock[0].timestamp,
              quantityRestocked: recentRestock[0].quantityRestocked,
              restocker: recentRestock[0].restockerPayrollNumber ? {
                payrollNumber: recentRestock[0].restockerPayrollNumber,
                firstName: recentRestock[0].restockerFirstName,
                lastName: recentRestock[0].restockerLastName,
                fullName: `${recentRestock[0].restockerFirstName} ${recentRestock[0].restockerLastName}`,
              } : null,
            } : null,
          };
        })
      );

      // Filter by low stock if requested
      const filteredAssets = lowStockOnly 
        ? assetsWithTracking.filter(asset => asset.stockMetrics.isLowStock)
        : assetsWithTracking;

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        assets: filteredAssets,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPreviousPage,
        },
        summary: {
          totalAssets: totalCount,
          lowStockAssets: assetsWithTracking.filter(asset => asset.stockMetrics.isLowStock).length,
          activeAssets: assetsWithTracking.filter(asset => asset.bulkStatus === 'active').length,
          outOfStockAssets: assetsWithTracking.filter(asset => asset.bulkStatus === 'out_of_stock').length,
          discontinuedAssets: assetsWithTracking.filter(asset => asset.bulkStatus === 'discontinued').length,
        },
      };

    } catch (error) {
      console.error("Error in getTrackedBulkAssets:", error);
      throw error;
    }
  }
}