// lib/services/assetAssignmentService.ts
import { db } from "@/db/connection";
import {
  assetAssignment,
  assets,
  users,
  locations,
  assetMovement,
} from "@/db/schema";
import { eq, and, like, or, desc, asc, sql, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

// Enhanced CreateAssignmentData interface
interface CreateAssignmentData {
  assetId: number;
  assignedTo: string;
  assignedBy: string;
  conditionIssued?: "excellent" | "good" | "fair" | "poor" | "damaged"; // Use enum values
  quantity: number;
  notes?: string;
  // Optional: Override default location logic
  forceLocationId?: number;
}

export interface AssignmentFilters {
  assignedBy?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "dateIssued" | "assetName" | "assignedTo" | "assignedBy";
  sortOrder?: "asc" | "desc";
  status?: "active" | "returned";
}

export interface AssignmentWithDetails {
  assignmentId: number;
  assetId: number;
  assetName: string;
  serialNumber: string | null;
  isBulk: boolean;
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  dateIssued: Date;
  conditionIssued: string;
  notes: string | null;
  quantity: number;
  quantityReturned: number;
  quantityRemaining: number;
  status: "active" | "returned";
  dateReturned: Date | null;
  conditionReturned: string | null;
  locationName: string;
  individualStatus: "in_use" | "not_in_use" | "retired" | null;
}

// ✅ NEW: Type definition for the comprehensive assignment response
interface AssignmentDetailsResponse {
  // Assignment Details
  assignmentId: number;
  dateIssued: Date;
  conditionIssued: string;
  quantity: number;
  notes: string | null;

  // Asset Details
  asset: {
    assetId: number;
    name: string;
    serialNumber: string | null;
    isBulk: boolean;
    individualStatus: "in_use" | "not_in_use" | "retired" | null;
    currentLocation: {
      locationId: number;
      departmentName: string;
      regionName: string;
      locationName: string;
    };
  };

  // Assignment Parties
  assignedTo: {
    payrollNumber: string;
    fullName: string;
    firstName: string;
    lastName: string;
  };
  assignedBy: {
    payrollNumber: string;
    fullName: string;
    firstName: string;
    lastName: string;
  };

  // Current Assignment Status
  status: {
    isCurrentlyAssigned: boolean;
    isInUse: boolean | null; // null for bulk assets
    dateReturned: Date | null;
    conditionReturned: string | null;
    quantityReturned: number;
    quantityRemaining: number;
  };

  // Movement Details
  locationChanged: boolean;
  previousLocationId: number;
  newLocationId: number;
}

export class AssetAssignmentService {
  /**
   * Create a new asset assignment (works for both unique and bulk assets)
   */

  static async createAssignment(
    data: CreateAssignmentData,
  ): Promise<{
    success: boolean;
    assignmentId?: number;
    assignmentDetails?: AssignmentDetailsResponse;
    message: string;
  }> {
    try {
      // Get asset details with current location
      const asset = await db
        .select({
          assetId: assets.assetId,
          name: assets.name,
          isBulk: assets.isBulk,
          serialNumber: assets.serialNumber,
          currentStockLevel: assets.currentStockLevel,
          individualStatus: assets.individualStatus,
          locationId: assets.locationId,
          currentKeeperPayrollNumber: assets.keeperPayrollNumber,
        })
        .from(assets)
        .where(eq(assets.assetId, data.assetId))
        .limit(1);

      if (asset.length === 0) {
        return { success: false, message: "Asset not found" };
      }

      const assetDetails = asset[0];

      // Get user details including their default location
      const user = await db
        .select({
          payrollNumber: users.payrollNumber,
          firstName: users.firstName,
          lastName: users.lastName,
          defaultLocationId: users.defaultLocationId,
          defaultLocation: {
            locationId: locations.locationId,
            departmentName: locations.departmentName,
            regionName: locations.regionName,
          },
        })
        .from(users)
        .leftJoin(locations, eq(users.defaultLocationId, locations.locationId))
        .where(eq(users.payrollNumber, data.assignedTo))
        .limit(1);

      if (user.length === 0) {
        return { success: false, message: "User not found" };
      }

      const userDetails = user[0];

      // Get assignedBy user details
      const [assignedByUser] = await db
        .select({
          payrollNumber: users.payrollNumber,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.payrollNumber, data.assignedBy))
        .limit(1);

      if (!assignedByUser) {
        return { success: false, message: "Assigning user not found" };
      }

      // Determine target location for the asset
      const targetLocationId =
        data.forceLocationId || // Manual override
        userDetails.defaultLocationId || // User's default location
        assetDetails.locationId; // Fallback to current location

      if (!targetLocationId) {
        return {
          success: false,
          message:
            "Cannot determine target location. User has no default location set.",
        };
      }

      // Validation for unique assets
      if (!assetDetails.isBulk) {
        if (data.quantity !== 1) {
          return {
            success: false,
            message: "Unique assets can only be assigned with quantity 1",
          };
        }

        // Check if asset is already in use by status
        if (assetDetails.individualStatus === "in_use") {
          return {
            success: false,
            message: "Asset is already in use and cannot be assigned",
          };
        }

        // Check if asset is retired
        if (assetDetails.individualStatus === "retired") {
          return {
            success: false,
            message: "Retired assets cannot be assigned",
          };
        }

        // Double-check for existing active assignments (safety net)
        const existingAssignment = await db
          .select({ assignmentId: assetAssignment.assignmentId })
          .from(assetAssignment)
          .where(
            and(
              eq(assetAssignment.assetId, data.assetId),
              isNull(assetAssignment.dateReturned),
            ),
          )
          .limit(1);

        if (existingAssignment.length > 0) {
          return {
            success: false,
            message:
              "Asset has an active assignment that must be returned first",
          };
        }
      } else {
        // Bulk asset stock validation
        if (
          !assetDetails.currentStockLevel ||
          assetDetails.currentStockLevel < data.quantity
        ) {
          return { success: false, message: "Insufficient stock available" };
        }

        // Update stock level for bulk assets
        await db
          .update(assets)
          .set({
            currentStockLevel: sql`${assets.currentStockLevel} - ${data.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(assets.assetId, data.assetId));
      }

      // Create the assignment
      const [newAssignment] = await db
        .insert(assetAssignment)
        .values({
          assetId: data.assetId,
          assignedTo: data.assignedTo,
          assignedBy: data.assignedBy,
          conditionIssued: (data.conditionIssued || "good") as
            | "excellent"
            | "good"
            | "fair"
            | "poor"
            | "damaged",
          notes: data.notes,
          quantity: data.quantity,
        })
        .returning({
          assignmentId: assetAssignment.assignmentId,
          dateIssued: assetAssignment.dateIssued,
        });

      // Update asset with proper enum value and conditional logic
      const assetUpdateData: any = {
        locationId: targetLocationId,
        keeperPayrollNumber: data.assignedTo, // Person becomes responsible
        updatedAt: new Date(),
      };

      // Only update individualStatus for unique assets
      if (!assetDetails.isBulk) {
        assetUpdateData.individualStatus = "in_use";
      }

      await db
        .update(assets)
        .set(assetUpdateData)
        .where(eq(assets.assetId, data.assetId));

      // Create movement record if location changed
      if (assetDetails.locationId !== targetLocationId) {
        await db.insert(assetMovement).values({
          assetId: data.assetId,
          fromLocationId: assetDetails.locationId,
          toLocationId: targetLocationId,
          movedBy: data.assignedBy,
          movementType: "assignment",
          quantity: data.quantity,
          notes: `Asset assigned to ${userDetails.firstName} ${userDetails.lastName} (${data.assignedTo}) in ${userDetails.defaultLocation?.departmentName || "Unknown Department"}`,
        });
      }

      // ✅ NEW: Get target location details for response
      const [targetLocation] = await db
        .select({
          locationId: locations.locationId,
          departmentName: locations.departmentName,
          regionName: locations.regionName,
        })
        .from(locations)
        .where(eq(locations.locationId, targetLocationId))
        .limit(1);

      // ✅ NEW: Build comprehensive assignment details response
      const assignmentDetailsResponse: AssignmentDetailsResponse = {
        // Assignment Details
        assignmentId: newAssignment.assignmentId,
        dateIssued: newAssignment.dateIssued,
        conditionIssued: data.conditionIssued || "good",
        quantity: data.quantity,
        notes: data.notes || null,

        // Asset Details
        asset: {
          assetId: assetDetails.assetId,
          name: assetDetails.name,
          serialNumber: assetDetails.serialNumber,
          isBulk: assetDetails.isBulk,
          individualStatus: !assetDetails.isBulk ? "in_use" : null, // Current status after assignment
          currentLocation: {
            locationId: targetLocation?.locationId || targetLocationId,
            departmentName:
              targetLocation?.departmentName || "Unknown Department",
            regionName: targetLocation?.regionName || "Unknown Region",
            locationName: `${targetLocation?.regionName || "Unknown Region"} - ${targetLocation?.departmentName || "Unknown Department"}`,
          },
        },

        // Assignment Parties
        assignedTo: {
          payrollNumber: userDetails.payrollNumber,
          fullName: `${userDetails.firstName} ${userDetails.lastName}`,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
        },
        assignedBy: {
          payrollNumber: assignedByUser.payrollNumber,
          fullName: `${assignedByUser.firstName} ${assignedByUser.lastName}`,
          firstName: assignedByUser.firstName,
          lastName: assignedByUser.lastName,
        },

        // Current Assignment Status
        status: {
          isCurrentlyAssigned: true,
          isInUse: !assetDetails.isBulk ? true : null, // Only relevant for unique assets
          dateReturned: null,
          conditionReturned: null,
          quantityReturned: 0,
          quantityRemaining: data.quantity,
        },

        // Movement Details (if location changed)
        locationChanged: assetDetails.locationId !== targetLocationId,
        previousLocationId: assetDetails.locationId,
        newLocationId: targetLocationId,
      };

      return {
        success: true,
        assignmentId: newAssignment.assignmentId,
        assignmentDetails: assignmentDetailsResponse,
        message: `Asset assigned successfully to ${userDetails.firstName} ${userDetails.lastName}${
          assetDetails.locationId !== targetLocationId
            ? ` and moved to ${userDetails.defaultLocation?.departmentName}`
            : ""
        }${!assetDetails.isBulk ? ". Asset status updated to 'in use'" : ""}`,
      };
    } catch (error) {
      console.error("Error creating assignment:", error);
      return { success: false, message: "Failed to create assignment" };
    }
  }

  /**
   * Get all unique asset assignments with filters
   */
  static async getUniqueAssignments(filters: AssignmentFilters = {}) {
    try {
      const {
        assignedBy,
        assignedTo,
        search,
        page = 1,
        limit = 10,
        sortBy = "dateIssued",
        sortOrder = "desc",
        status,
      } = filters;

      // Create aliases for users table to handle both assignedBy and assignedTo
      const assignedToUser = alias(users, "assignedToUser");
      const assignedByUser = alias(users, "assignedByUser");

      // Build conditions array
      const conditions: SQL[] = [eq(assets.isBulk, false)];

      if (assignedBy) {
        conditions.push(eq(assetAssignment.assignedBy, assignedBy));
      }

      if (assignedTo) {
        conditions.push(eq(assetAssignment.assignedTo, assignedTo));
      }

      if (search) {
        const searchCondition = or(
          like(assets.name, `%${search}%`),
          like(assets.serialNumber, `%${search}%`),
          like(
            sql`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`,
            `%${search}%`,
          ),
          like(
            sql`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`,
            `%${search}%`,
          ),
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      // Determine sort column
      const sortColumn =
        sortBy === "assetName"
          ? assets.name
          : sortBy === "assignedTo"
            ? sql`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`
            : sortBy === "assignedBy"
              ? sql`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`
              : assetAssignment.dateIssued;

      // Build the complete query in one go
      const offset = (page - 1) * limit;

      const assignments = await db
        .select({
          assignmentId: assetAssignment.assignmentId,
          assetId: assetAssignment.assetId,
          assetName: assets.name,
          serialNumber: assets.serialNumber,
          isBulk: assets.isBulk,
          individualStatus: assets.individualStatus,
          assignedTo: assetAssignment.assignedTo,
          assignedToName: sql<string>`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`,
          assignedBy: assetAssignment.assignedBy,
          assignedByName: sql<string>`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`,
          dateIssued: assetAssignment.dateIssued,
          conditionIssued: assetAssignment.conditionIssued,
          notes: assetAssignment.notes,
          quantity: assetAssignment.quantity,
          locationName: sql<string>`${locations.regionName} || ' - ' || ${locations.departmentName}`,
        })
        .from(assetAssignment)
        .innerJoin(assets, eq(assetAssignment.assetId, assets.assetId))
        .innerJoin(
          assignedToUser,
          eq(assetAssignment.assignedTo, assignedToUser.payrollNumber),
        )
        .innerJoin(
          assignedByUser,
          eq(assetAssignment.assignedBy, assignedByUser.payrollNumber),
        )
        .innerJoin(locations, eq(assets.locationId, locations.locationId))
        .where(and(...conditions))
        .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [{ count: totalCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(assetAssignment)
        .innerJoin(assets, eq(assetAssignment.assetId, assets.assetId))
        .innerJoin(
          assignedToUser,
          eq(assetAssignment.assignedTo, assignedToUser.payrollNumber),
        )
        .innerJoin(
          assignedByUser,
          eq(assetAssignment.assignedBy, assignedByUser.payrollNumber),
        )
        .where(and(...conditions));

      // Transform results to include calculated fields
      const transformedAssignments: AssignmentWithDetails[] = assignments.map(
        (assignment) => ({
          ...assignment,
          quantityReturned: 0, // TODO: Calculate from return records
          quantityRemaining: assignment.quantity,
          status: "active" as const, // TODO: Calculate based on return status
          dateReturned: null,
          conditionReturned: null,
        }),
      );

      return {
        success: true,
        data: transformedAssignments,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching unique assignments:", error);
      return { success: false, message: "Failed to fetch assignments" };
    }
  }

  /**
   * Get all bulk asset assignments with filters
   */
  static async getBulkAssignments(filters: AssignmentFilters = {}) {
    try {
      const {
        assignedBy,
        assignedTo,
        search,
        page = 1,
        limit = 10,
        sortBy = "dateIssued",
        sortOrder = "desc",
      } = filters;

      const assignedToUser = alias(users, "assignedToUser");
      const assignedByUser = alias(users, "assignedByUser");

      // Build conditions array
      const conditions: SQL[] = [eq(assets.isBulk, true)];

      if (assignedBy) {
        conditions.push(eq(assetAssignment.assignedBy, assignedBy));
      }

      if (assignedTo) {
        conditions.push(eq(assetAssignment.assignedTo, assignedTo));
      }

      if (search) {
        const searchCondition = or(
          like(assets.name, `%${search}%`),
          like(
            sql`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`,
            `%${search}%`,
          ),
          like(
            sql`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`,
            `%${search}%`,
          ),
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      // Determine sort column
      const sortColumn =
        sortBy === "assetName"
          ? assets.name
          : sortBy === "assignedTo"
            ? sql`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`
            : sortBy === "assignedBy"
              ? sql`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`
              : assetAssignment.dateIssued;

      // Build the complete query in one go
      const offset = (page - 1) * limit;

      const assignments = await db
        .select({
          assignmentId: assetAssignment.assignmentId,
          assetId: assetAssignment.assetId,
          assetName: assets.name,
          serialNumber: assets.serialNumber,
          isBulk: assets.isBulk,
          individualStatus: assets.individualStatus,
          assignedTo: assetAssignment.assignedTo,
          assignedToName: sql<string>`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`,
          assignedBy: assetAssignment.assignedBy,
          assignedByName: sql<string>`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`,
          dateIssued: assetAssignment.dateIssued,
          conditionIssued: assetAssignment.conditionIssued,
          notes: assetAssignment.notes,
          quantity: assetAssignment.quantity,
          locationName: sql<string>`${locations.regionName} || ' - ' || ${locations.departmentName}`,
        })
        .from(assetAssignment)
        .innerJoin(assets, eq(assetAssignment.assetId, assets.assetId))
        .innerJoin(
          assignedToUser,
          eq(assetAssignment.assignedTo, assignedToUser.payrollNumber),
        )
        .innerJoin(
          assignedByUser,
          eq(assetAssignment.assignedBy, assignedByUser.payrollNumber),
        )
        .innerJoin(locations, eq(assets.locationId, locations.locationId))
        .where(and(...conditions))
        .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count: totalCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(assetAssignment)
        .innerJoin(assets, eq(assetAssignment.assetId, assets.assetId))
        .innerJoin(
          assignedToUser,
          eq(assetAssignment.assignedTo, assignedToUser.payrollNumber),
        )
        .innerJoin(
          assignedByUser,
          eq(assetAssignment.assignedBy, assignedByUser.payrollNumber),
        )
        .where(and(...conditions));

      // Transform results
      const transformedAssignments: AssignmentWithDetails[] = assignments.map(
        (assignment) => ({
          ...assignment,
          quantityReturned: 0, // TODO: Calculate from return records
          quantityRemaining: assignment.quantity,
          status: "active" as const,
          dateReturned: null,
          conditionReturned: null,
        }),
      );

      return {
        success: true,
        data: transformedAssignments,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching bulk assignments:", error);
      return { success: false, message: "Failed to fetch assignments" };
    }
  }

  /**
   * Get assignment by ID
   */
  static async getAssignmentById(assignmentId: number) {
    try {
      const assignedToUser = alias(users, "assignedToUser");
      const assignedByUser = alias(users, "assignedByUser");
      const [assignment] = await db
        .select({
          assignmentId: assetAssignment.assignmentId,
          assetId: assetAssignment.assetId,
          assetName: assets.name,
          serialNumber: assets.serialNumber,
          isBulk: assets.isBulk,
          individualStatus: assets.individualStatus, // ✅ Added this field
          assignedTo: assetAssignment.assignedTo,
          assignedToName: sql<string>`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`,
          assignedBy: assetAssignment.assignedBy,
          assignedByName: sql<string>`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`,
          dateIssued: assetAssignment.dateIssued,
          conditionIssued: assetAssignment.conditionIssued,
          notes: assetAssignment.notes,
          quantity: assetAssignment.quantity,
          locationName: sql<string>`${locations.regionName} || ' - ' || ${locations.departmentName}`,
        })
        .from(assetAssignment)
        .innerJoin(assets, eq(assetAssignment.assetId, assets.assetId))
        .innerJoin(
          assignedToUser,
          eq(assetAssignment.assignedTo, assignedToUser.payrollNumber),
        )
        .innerJoin(
          assignedByUser,
          eq(assetAssignment.assignedBy, assignedByUser.payrollNumber),
        )
        .innerJoin(locations, eq(assets.locationId, locations.locationId))
        .where(eq(assetAssignment.assignmentId, assignmentId))
        .limit(1);

      if (!assignment) {
        return { success: false, message: "Assignment not found" };
      }

      const transformedAssignment: AssignmentWithDetails = {
        ...assignment,
        quantityReturned: 0,
        quantityRemaining: assignment.quantity,
        status: "active" as const,
        dateReturned: null,
        conditionReturned: null,
      };

      return {
        success: true,
        data: transformedAssignment,
      };
    } catch (error) {
      console.error("Error fetching assignment:", error);
      return { success: false, message: "Failed to fetch assignment" };
    }
  }
  /**
   * Get available assets for assignment (not already assigned for unique, or have stock for bulk)
   */
  static async getAvailableAssets(type: "unique" | "bulk" | "all" = "all") {
    try {
      // Build conditions based on type
      const conditions: SQL[] = [];

      if (type === "unique") {
        conditions.push(
          eq(assets.isBulk, false),
          eq(assets.individualStatus, "not_in_use"),
        );
      } else if (type === "bulk") {
        conditions.push(
          eq(assets.isBulk, true),
          sql`${assets.currentStockLevel} > 0`,
        );
      }

      const availableAssets = await db
        .select({
          assetId: assets.assetId,
          name: assets.name,
          serialNumber: assets.serialNumber,
          isBulk: assets.isBulk,
          currentStockLevel: assets.currentStockLevel,
          individualStatus: assets.individualStatus,
          locationName: sql<string>`${locations.regionName} || ' - ' || ${locations.departmentName}`,
        })
        .from(assets)
        .innerJoin(locations, eq(assets.locationId, locations.locationId))
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        success: true,
        data: availableAssets,
      };
    } catch (error) {
      console.error("Error fetching available assets:", error);
      return { success: false, message: "Failed to fetch available assets" };
    }
  }

  /**
   * Update assignment notes
   */
  static async updateAssignmentNotes(assignmentId: number, notes: string) {
    try {
      await db
        .update(assetAssignment)
        .set({ notes })
        .where(eq(assetAssignment.assignmentId, assignmentId));

      return { success: true, message: "Assignment updated successfully" };
    } catch (error) {
      console.error("Error updating assignment:", error);
      return { success: false, message: "Failed to update assignment" };
    }
  }
}
