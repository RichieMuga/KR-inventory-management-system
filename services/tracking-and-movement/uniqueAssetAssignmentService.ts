import { db } from "@/db/connection";
import {
  assets,
  assetMovement,
  assetAssignment,
  users,
  locations,
  type Asset,
  type AssetMovement,
  type AssetAssignment,
} from "@/db/schema";
import { eq, and, desc, asc, ilike, isNull, isNotNull, sql, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// Types for service responses
export interface UniqueAssetWithDetails {
  assetId: number;
  name: string;
  serialNumber: string;
  modelNumber?: string;
  individualStatus: "in_use" | "not_in_use" | "retired";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Location details
  location: {
    locationId: number;
    regionName: string;
    departmentName: string;
  } | null;
  
  // Keeper details (if assigned)
  keeper?: {
    payrollNumber: string;
    firstName: string;
    lastName: string;
  };
  
  // Current assignment details (if any active assignment)
  currentAssignment?: {
    assignmentId: number;
    assignedTo: string;
    assignedToName: string;
    dateIssued: Date;
    conditionIssued: string;
    quantity: number;
  };
  
  // Latest movement
  latestMovement?: {
    movementId: number;
    fromLocation?: string;
    toLocation: string;
    movedBy: string;
    movedByName: string;
    movementType: string;
    timestamp: Date;
  };
}

export interface TrackingFilters {
  status?: "in_use" | "not_in_use" | "retired";
  locationId?: number;
  keeperPayrollNumber?: string;
  searchTerm?: string; // For searching by name, serial number, or model
  assignedTo?: string; // Filter by currently assigned user
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface TrackingResponse {
  assets: UniqueAssetWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UniqueAssetService {
  /**
   * Get paginated unique assets with detailed tracking information
   */
  static async getTrackedAssets(
    filters: TrackingFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<TrackingResponse> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Create aliases for joined tables to avoid conflicts
    const keeperUsers = alias(users, "keeper_users");
    const assignedUsers = alias(users, "assigned_users");
    const movedByUsers = alias(users, "moved_by_users");
    const fromLocations = alias(locations, "from_locations");

    // Build conditions array
    const conditions = [eq(assets.isBulk, false)];

    if (filters.status) {
      conditions.push(eq(assets.individualStatus, filters.status));
    }

    if (filters.locationId) {
      conditions.push(eq(assets.locationId, filters.locationId));
    }

    if (filters.keeperPayrollNumber) {
      conditions.push(eq(assets.keeperPayrollNumber, filters.keeperPayrollNumber));
    }

    if (filters.searchTerm) {
      const searchCondition = sql`(
        ${assets.name} ILIKE ${`%${filters.searchTerm}%`} OR
        ${assets.serialNumber} ILIKE ${`%${filters.searchTerm}%`} OR
        ${assets.modelNumber} ILIKE ${`%${filters.searchTerm}%`}
      )`;
      conditions.push(searchCondition);
    }

    // Get total count for pagination
    let countQuery = db
      .select({ count: count() })
      .from(assets);

    // Add assignment filter to count if needed
    if (filters.assignedTo) {
      countQuery = countQuery
        .leftJoin(
          assetAssignment,
          and(
            eq(assets.assetId, assetAssignment.assetId),
            isNull(assetAssignment.dateReturned)
          )
        );
      conditions.push(eq(assetAssignment.assignedTo, filters.assignedTo));
    }

    countQuery = countQuery.where(and(...conditions));

    const [{ count: total }] = await countQuery;

    // Main query to get asset details
    let query = db
      .select({
        // Asset fields
        assetId: assets.assetId,
        name: assets.name,
        serialNumber: assets.serialNumber,
        modelNumber: assets.modelNumber,
        individualStatus: assets.individualStatus,
        notes: assets.notes,
        createdAt: assets.createdAt,
        updatedAt: assets.updatedAt,
        
        // Location details
        locationId: locations.locationId,
        regionName: locations.regionName,
        departmentName: locations.departmentName,
        
        // Keeper details
        keeperPayrollNumber: keeperUsers.payrollNumber,
        keeperFirstName: keeperUsers.firstName,
        keeperLastName: keeperUsers.lastName,
      })
      .from(assets)
      .leftJoin(locations, eq(assets.locationId, locations.locationId))
      .leftJoin(keeperUsers, eq(assets.keeperPayrollNumber, keeperUsers.payrollNumber));

    // Add assignment join if needed
    if (filters.assignedTo) {
      query = query.leftJoin(
        assetAssignment,
        and(
          eq(assets.assetId, assetAssignment.assetId),
          isNull(assetAssignment.dateReturned)
        )
      );
    }

    // Apply all conditions
    query = query.where(and(...conditions));

    // Get paginated results
    const assetResults = await query
      .orderBy(asc(assets.name))
      .limit(limit)
      .offset(offset);

    // Get asset IDs for additional queries
    const assetIds = assetResults.map(a => a.assetId);

    // Get current assignments for these assets
    const currentAssignments = assetIds.length > 0 ? await db
      .select({
        assetId: assetAssignment.assetId,
        assignmentId: assetAssignment.assignmentId,
        assignedTo: assetAssignment.assignedTo,
        assignedToFirstName: assignedUsers.firstName,
        assignedToLastName: assignedUsers.lastName,
        dateIssued: assetAssignment.dateIssued,
        conditionIssued: assetAssignment.conditionIssued,
        quantity: assetAssignment.quantity,
      })
      .from(assetAssignment)
      .leftJoin(assignedUsers, eq(assetAssignment.assignedTo, assignedUsers.payrollNumber))
      .where(
        and(
          sql`${assetAssignment.assetId} IN (${sql.join(assetIds.map(id => sql`${id}`), sql`, `)})`,
          isNull(assetAssignment.dateReturned)
        )
      ) : [];

    // Get latest movements for these assets
    const latestMovements = assetIds.length > 0 ? await db
      .select({
        assetId: assetMovement.assetId,
        movementId: assetMovement.movementId,
        fromLocationName: sql<string>`CASE 
          WHEN ${fromLocations.regionName} IS NOT NULL 
          THEN ${fromLocations.regionName} || ' - ' || ${fromLocations.departmentName}
          ELSE NULL 
        END`,
        toLocationName: sql<string>`${locations.regionName} || ' - ' || ${locations.departmentName}`,
        movedBy: assetMovement.movedBy,
        movedByFirstName: movedByUsers.firstName,
        movedByLastName: movedByUsers.lastName,
        movementType: assetMovement.movementType,
        timestamp: assetMovement.timestamp,
        rowNumber: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${assetMovement.assetId} ORDER BY ${assetMovement.timestamp} DESC)`,
      })
      .from(assetMovement)
      .leftJoin(fromLocations, eq(assetMovement.fromLocationId, fromLocations.locationId))
      .leftJoin(locations, eq(assetMovement.toLocationId, locations.locationId))
      .leftJoin(movedByUsers, eq(assetMovement.movedBy, movedByUsers.payrollNumber))
      .where(sql`${assetMovement.assetId} IN (${sql.join(assetIds.map(id => sql`${id}`), sql`, `)})`) : [];

    // Filter to get only the latest movement per asset
    const latestMovementsOnly = latestMovements.filter(m => m.rowNumber === 1);

    // Create lookup maps
    const assignmentMap = new Map(
      currentAssignments.map(a => [a.assetId, a])
    );
    const movementMap = new Map(
      latestMovementsOnly.map(m => [m.assetId, m])
    );

    // Transform results
    const transformedAssets: UniqueAssetWithDetails[] = assetResults.map(asset => {
      const assignment = assignmentMap.get(asset.assetId);
      const movement = movementMap.get(asset.assetId);

      return {
        assetId: asset.assetId,
        name: asset.name,
        serialNumber: asset.serialNumber!,
        modelNumber: asset.modelNumber || undefined,
        individualStatus: asset.individualStatus!,
        notes: asset.notes || undefined,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
        
        location: asset.locationId ? {
          locationId: asset.locationId,
          regionName: asset.regionName!,
          departmentName: asset.departmentName!,
        } : null,
        
        keeper: asset.keeperPayrollNumber ? {
          payrollNumber: asset.keeperPayrollNumber,
          firstName: asset.keeperFirstName!,
          lastName: asset.keeperLastName!,
        } : undefined,
        
        currentAssignment: assignment ? {
          assignmentId: assignment.assignmentId,
          assignedTo: assignment.assignedTo,
          assignedToName: `${assignment.assignedToFirstName} ${assignment.assignedToLastName}`,
          dateIssued: assignment.dateIssued,
          conditionIssued: assignment.conditionIssued!,
          quantity: assignment.quantity,
        } : undefined,
        
        latestMovement: movement ? {
          movementId: movement.movementId,
          fromLocation: movement.fromLocationName || undefined,
          toLocation: movement.toLocationName!,
          movedBy: movement.movedBy,
          movedByName: `${movement.movedByFirstName} ${movement.movedByLastName}`,
          movementType: movement.movementType!,
          timestamp: movement.timestamp,
        } : undefined,
      };
    });

    return {
      assets: transformedAssets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get detailed tracking history for a specific asset
   */
  static async getAssetTrackingHistory(assetId: number) {
    // Get asset details
    const assetQuery = await db
      .select({
        asset: assets,
        location: locations,
        keeper: users,
      })
      .from(assets)
      .leftJoin(locations, eq(assets.locationId, locations.locationId))
      .leftJoin(users, eq(assets.keeperPayrollNumber, users.payrollNumber))
      .where(and(eq(assets.assetId, assetId), eq(assets.isBulk, false)))
      .limit(1);

    if (assetQuery.length === 0) {
      throw new Error("Asset not found or is not a unique asset");
    }

    // Create aliases for the movement history query
    const fromLoc = alias(locations, "from_loc");
    const toLoc = alias(locations, "to_loc");
    const movedByUser = alias(users, "moved_by_user");

    // Get movement history
    const movements = await db
      .select({
        movementId: assetMovement.movementId,
        fromLocationId: assetMovement.fromLocationId,
        toLocationId: assetMovement.toLocationId,
        fromLocationName: sql<string>`CASE 
          WHEN ${fromLoc.regionName} IS NOT NULL 
          THEN ${fromLoc.regionName} || ' - ' || ${fromLoc.departmentName}
          ELSE NULL 
        END`,
        toLocationName: sql<string>`${toLoc.regionName} || ' - ' || ${toLoc.departmentName}`,
        movedBy: assetMovement.movedBy,
        movedByName: sql<string>`${movedByUser.firstName} || ' ' || ${movedByUser.lastName}`,
        movementType: assetMovement.movementType,
        quantity: assetMovement.quantity,
        timestamp: assetMovement.timestamp,
        notes: assetMovement.notes,
      })
      .from(assetMovement)
      .leftJoin(fromLoc, eq(assetMovement.fromLocationId, fromLoc.locationId))
      .leftJoin(toLoc, eq(assetMovement.toLocationId, toLoc.locationId))
      .leftJoin(movedByUser, eq(assetMovement.movedBy, movedByUser.payrollNumber))
      .where(eq(assetMovement.assetId, assetId))
      .orderBy(desc(assetMovement.timestamp));

    // Create aliases for assignment history
    const assignedUser = alias(users, "assigned_user");
    const assignedByUser = alias(users, "assigned_by_user");

    // Get assignment history
    const assignments = await db
      .select({
        assignmentId: assetAssignment.assignmentId,
        assignedTo: assetAssignment.assignedTo,
        assignedToName: sql<string>`${assignedUser.firstName} || ' ' || ${assignedUser.lastName}`,
        assignedBy: assetAssignment.assignedBy,
        assignedByName: sql<string>`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`,
        dateIssued: assetAssignment.dateIssued,
        conditionIssued: assetAssignment.conditionIssued,
        dateReturned: assetAssignment.dateReturned,
        conditionReturned: assetAssignment.conditionReturned,
        quantity: assetAssignment.quantity,
        quantityReturned: assetAssignment.quantityReturned,
        notes: assetAssignment.notes,
      })
      .from(assetAssignment)
      .leftJoin(assignedUser, eq(assetAssignment.assignedTo, assignedUser.payrollNumber))
      .leftJoin(assignedByUser, eq(assetAssignment.assignedBy, assignedByUser.payrollNumber))
      .where(eq(assetAssignment.assetId, assetId))
      .orderBy(desc(assetAssignment.dateIssued));

    return {
      asset: assetQuery[0],
      movements,
      assignments,
    };
  }

  /**
   * Get assets that are overdue for return or need attention
   */
  static async getAssetsNeedingAttention() {
    const assignedUser = alias(users, "assigned_user");

    // Assets assigned but not returned after 30 days (configurable)
    const overdueAssignments = await db
      .select({
        assetId: assets.assetId,
        assetName: assets.name,
        serialNumber: assets.serialNumber,
        assignmentId: assetAssignment.assignmentId,
        assignedTo: assetAssignment.assignedTo,
        assignedToName: sql<string>`${assignedUser.firstName} || ' ' || ${assignedUser.lastName}`,
        dateIssued: assetAssignment.dateIssued,
        daysSinceIssued: sql<number>`EXTRACT(DAY FROM NOW() - ${assetAssignment.dateIssued})`,
        locationName: sql<string>`${locations.regionName} || ' - ' || ${locations.departmentName}`,
      })
      .from(assets)
      .innerJoin(assetAssignment, eq(assets.assetId, assetAssignment.assetId))
      .leftJoin(assignedUser, eq(assetAssignment.assignedTo, assignedUser.payrollNumber))
      .leftJoin(locations, eq(assets.locationId, locations.locationId))
      .where(
        and(
          eq(assets.isBulk, false),
          isNull(assetAssignment.dateReturned),
          sql`${assetAssignment.dateIssued} < NOW() - INTERVAL '30 days'`
        )
      )
      .orderBy(asc(assetAssignment.dateIssued));

    return {
      overdueAssignments,
    };
  }

  /**
   * Get summary statistics for unique asset tracking
   */
  static async getTrackingSummary() {
    const summary = await db
      .select({
        totalUniqueAssets: sql<number>`COUNT(*)`,
        inUse: sql<number>`SUM(CASE WHEN ${assets.individualStatus} = 'in_use' THEN 1 ELSE 0 END)`,
        notInUse: sql<number>`SUM(CASE WHEN ${assets.individualStatus} = 'not_in_use' THEN 1 ELSE 0 END)`,
        retired: sql<number>`SUM(CASE WHEN ${assets.individualStatus} = 'retired' THEN 1 ELSE 0 END)`,
        currentlyAssigned: sql<number>`COUNT(DISTINCT ${assetAssignment.assetId})`,
      })
      .from(assets)
      .leftJoin(
        assetAssignment,
        and(
          eq(assets.assetId, assetAssignment.assetId),
          isNull(assetAssignment.dateReturned)
        )
      )
      .where(eq(assets.isBulk, false));

    return summary[0];
  }

  /**
   * Get a single asset by ID with full details
   */
  static async getAssetById(assetId: number): Promise<UniqueAssetWithDetails | null> {
    // Get asset details directly from database
    const assetResults = await db
      .select({
        assetId: assets.assetId,
        name: assets.name,
        serialNumber: assets.serialNumber,
        modelNumber: assets.modelNumber,
        individualStatus: assets.individualStatus,
        notes: assets.notes,
        createdAt: assets.createdAt,
        updatedAt: assets.updatedAt,
        locationId: locations.locationId,
        regionName: locations.regionName,
        departmentName: locations.departmentName,
        keeperPayrollNumber: users.payrollNumber,
        keeperFirstName: users.firstName,
        keeperLastName: users.lastName,
      })
      .from(assets)
      .leftJoin(locations, eq(assets.locationId, locations.locationId))
      .leftJoin(users, eq(assets.keeperPayrollNumber, users.payrollNumber))
      .where(and(eq(assets.assetId, assetId), eq(assets.isBulk, false)))
      .limit(1);

    if (assetResults.length === 0) return null;

    const asset = assetResults[0];

    // Get current assignment
    const currentAssignmentResult = await db
      .select({
        assignmentId: assetAssignment.assignmentId,
        assignedTo: assetAssignment.assignedTo,
        assignedToFirstName: users.firstName,
        assignedToLastName: users.lastName,
        dateIssued: assetAssignment.dateIssued,
        conditionIssued: assetAssignment.conditionIssued,
        quantity: assetAssignment.quantity,
      })
      .from(assetAssignment)
      .leftJoin(users, eq(assetAssignment.assignedTo, users.payrollNumber))
      .where(
        and(
          eq(assetAssignment.assetId, assetId),
          isNull(assetAssignment.dateReturned)
        )
      )
      .limit(1);

    // Get latest movement
    const latestMovementResult = await db
      .select({
        movementId: assetMovement.movementId,
        fromLocationName: sql<string>`CASE 
          WHEN from_loc.region_name IS NOT NULL 
          THEN from_loc.region_name || ' - ' || from_loc.department_name
          ELSE NULL 
        END`,
        toLocationName: sql<string>`to_loc.region_name || ' - ' || to_loc.department_name`,
        movedBy: assetMovement.movedBy,
        movedByFirstName: users.firstName,
        movedByLastName: users.lastName,
        movementType: assetMovement.movementType,
        timestamp: assetMovement.timestamp,
      })
      .from(assetMovement)
      .leftJoin(alias(locations, "from_loc"), sql`${assetMovement.fromLocationId} = from_loc.location_id`)
      .leftJoin(alias(locations, "to_loc"), sql`${assetMovement.toLocationId} = to_loc.location_id`)
      .leftJoin(users, eq(assetMovement.movedBy, users.payrollNumber))
      .where(eq(assetMovement.assetId, assetId))
      .orderBy(desc(assetMovement.timestamp))
      .limit(1);

    const currentAssignment = currentAssignmentResult[0];
    const latestMovement = latestMovementResult[0];

    return {
      assetId: asset.assetId,
      name: asset.name,
      serialNumber: asset.serialNumber!,
      modelNumber: asset.modelNumber || undefined,
      individualStatus: asset.individualStatus!,
      notes: asset.notes || undefined,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      
      location: asset.locationId ? {
        locationId: asset.locationId,
        regionName: asset.regionName!,
        departmentName: asset.departmentName!,
      } : null,
      
      keeper: asset.keeperPayrollNumber ? {
        payrollNumber: asset.keeperPayrollNumber,
        firstName: asset.keeperFirstName!,
        lastName: asset.keeperLastName!,
      } : undefined,
      
      currentAssignment: currentAssignment ? {
        assignmentId: currentAssignment.assignmentId,
        assignedTo: currentAssignment.assignedTo,
        assignedToName: `${currentAssignment.assignedToFirstName} ${currentAssignment.assignedToLastName}`,
        dateIssued: currentAssignment.dateIssued,
        conditionIssued: currentAssignment.conditionIssued!,
        quantity: currentAssignment.quantity,
      } : undefined,
      
      latestMovement: latestMovement ? {
        movementId: latestMovement.movementId,
        fromLocation: latestMovement.fromLocationName || undefined,
        toLocation: latestMovement.toLocationName!,
        movedBy: latestMovement.movedBy,
        movedByName: `${latestMovement.movedByFirstName} ${latestMovement.movedByLastName}`,
        movementType: latestMovement.movementType!,
        timestamp: latestMovement.timestamp,
      } : undefined,
    };
  }
}