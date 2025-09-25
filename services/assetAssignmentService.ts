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
              isNull(assetAssignment.deletedAt)
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

      // Build comprehensive assignment details response
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
   *  Soft delete an assignment and restore asset state
   */
  static async deleteAssignment(
    assignmentId: number,
    deletedBy: string,
    reason?: string
  ): Promise<{
    success: boolean;
    message: string;
    restoredAsset?: {
      assetId: number;
      name: string;
      newStatus: string;
      stockRestored?: number;
    };
  }> {
    try {
      // First, get the assignment details with asset info
      const assignedToUser = alias(users, "assignedToUser");
      const [assignment] = await db
        .select({
          assignmentId: assetAssignment.assignmentId,
          assetId: assetAssignment.assetId,
          assignedTo: assetAssignment.assignedTo,
          assignedBy: assetAssignment.assignedBy,
          quantity: assetAssignment.quantity,
          quantityReturned: assetAssignment.quantityReturned,
          dateReturned: assetAssignment.dateReturned,
          deletedAt: assetAssignment.deletedAt,
          assetName: assets.name,
          isBulk: assets.isBulk,
          currentStockLevel: assets.currentStockLevel,
          individualStatus: assets.individualStatus,
          locationId: assets.locationId,
          assignedToName: sql<string>`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`,
        })
        .from(assetAssignment)
        .innerJoin(assets, eq(assetAssignment.assetId, assets.assetId))
        .innerJoin(
          assignedToUser,
          eq(assetAssignment.assignedTo, assignedToUser.payrollNumber),
        )
        .where(eq(assetAssignment.assignmentId, assignmentId))
        .limit(1);

      if (!assignment) {
        return { success: false, message: "Assignment not found" };
      }

      // Check if assignment is already deleted
      if (assignment.deletedAt) {
        return { success: false, message: "Assignment is already deleted" };
      }

      // Verify the user performing the delete exists
      const [deletingUser] = await db
        .select({
          payrollNumber: users.payrollNumber,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.payrollNumber, deletedBy))
        .limit(1);

      if (!deletingUser) {
        return { success: false, message: "Deleting user not found" };
      }

      // Calculate quantities to restore
      const quantityToRestore = assignment.quantity - (assignment.quantityReturned || 0);

      // Prepare asset update data
      const assetUpdateData: any = {
        updatedAt: new Date(),
      };

      let newStatus = "";
      let stockRestored: number | undefined;

      if (assignment.isBulk) {
        // For bulk assets: restore stock
        if (quantityToRestore > 0) {
          assetUpdateData.currentStockLevel = sql`${assets.currentStockLevel} + ${quantityToRestore}`;
          stockRestored = quantityToRestore;
        }
        newStatus = "Stock restored";

        // If assignment was not returned, clear the keeper
        if (!assignment.dateReturned) {
          assetUpdateData.keeperPayrollNumber = null;
        }
      } else {
        // For unique assets: change status to not_in_use if not returned
        if (!assignment.dateReturned) {
          assetUpdateData.individualStatus = "not_in_use";
          assetUpdateData.keeperPayrollNumber = null;
          newStatus = "Available for assignment";
        } else {
          newStatus = "Already returned";
        }
      }

      // Update the asset
      await db
        .update(assets)
        .set(assetUpdateData)
        .where(eq(assets.assetId, assignment.assetId));

      // Create a movement record for the deletion/restoration
      const movementNotes = reason 
        ? `Assignment deleted by ${deletingUser.firstName} ${deletingUser.lastName}. Reason: ${reason}`
        : `Assignment deleted by ${deletingUser.firstName} ${deletingUser.lastName}`;

      await db.insert(assetMovement).values({
        assetId: assignment.assetId,
        fromLocationId: assignment.locationId,
        toLocationId: assignment.locationId, // Same location, just status change
        movedBy: deletedBy,
        movementType: "adjustment",
        quantity: quantityToRestore,
        notes: movementNotes,
      });

      // ✅ UPDATED: Soft delete the assignment instead of hard delete
      await db
        .update(assetAssignment)
        .set({
          deletedAt: new Date(),
          deletedBy: deletedBy,
          deletionReason: reason || null,
        })
        .where(eq(assetAssignment.assignmentId, assignmentId));

      return {
        success: true,
        message: `Assignment deleted successfully. Asset "${assignment.assetName}" ${
          assignment.isBulk 
            ? `stock restored by ${quantityToRestore} units` 
            : "is now available for assignment"
        }`,
        restoredAsset: {
          assetId: assignment.assetId,
          name: assignment.assetName,
          newStatus,
          stockRestored,
        },
      };
    } catch (error) {
      console.error("Error deleting assignment:", error);
      return { success: false, message: "Failed to delete assignment" };
    }
  }

  /**
   * Get ALL assignments for an asset including soft-deleted ones (for debugging)
   */
  static async getAllAssignmentsForAsset(assetId: number) {
    try {
      const assignedToUser = alias(users, "assignedToUser");
      const assignedByUser = alias(users, "assignedByUser");
      const deletedByUser = alias(users, "deletedByUser");

      const assignments = await db
        .select({
          assignmentId: assetAssignment.assignmentId,
          assetId: assetAssignment.assetId,
          assetName: assets.name,
          assignedTo: assetAssignment.assignedTo,
          assignedToName: sql<string>`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`,
          assignedBy: assetAssignment.assignedBy,
          assignedByName: sql<string>`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`,
          dateIssued: assetAssignment.dateIssued,
          dateReturned: assetAssignment.dateReturned,
          quantity: assetAssignment.quantity,
          quantityReturned: assetAssignment.quantityReturned,
          // Soft delete fields
          deletedAt: assetAssignment.deletedAt,
          deletedBy: assetAssignment.deletedBy,
          deletedByName: sql<string>`CASE WHEN ${assetAssignment.deletedBy} IS NOT NULL THEN ${deletedByUser.firstName} || ' ' || ${deletedByUser.lastName} ELSE NULL END`,
          deletionReason: assetAssignment.deletionReason,
          // Status flags
          isActive: sql<boolean>`${assetAssignment.dateReturned} IS NULL AND ${assetAssignment.deletedAt} IS NULL`,
          isReturned: sql<boolean>`${assetAssignment.dateReturned} IS NOT NULL`,
          isSoftDeleted: sql<boolean>`${assetAssignment.deletedAt} IS NOT NULL`,
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
        .leftJoin(
          deletedByUser,
          eq(assetAssignment.deletedBy, deletedByUser.payrollNumber),
        )
        .where(eq(assetAssignment.assetId, assetId))
        .orderBy(desc(assetAssignment.dateIssued));

      return {
        success: true,
        data: assignments,
        summary: {
          total: assignments.length,
          active: assignments.filter(a => a.isActive).length,
          returned: assignments.filter(a => a.isReturned).length,
          softDeleted: assignments.filter(a => a.isSoftDeleted).length,
        },
      };
    } catch (error) {
      console.error("Error fetching all assignments for asset:", error);
      return { success: false, message: "Failed to fetch assignments" };
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

      const assignedToUser = alias(users, "assignedToUser");
      const assignedByUser = alias(users, "assignedByUser");

      // Build conditions array with soft delete filter
      const conditions: SQL[] = [
        eq(assets.isBulk, false),
        isNull(assetAssignment.deletedAt) // Exclude soft-deleted records
      ];

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

      // ✅ UPDATED: Count with soft delete filter
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

      const transformedAssignments: AssignmentWithDetails[] = assignments.map(
        (assignment) => ({
          ...assignment,
          quantityReturned: 0,
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

      // ✅ UPDATED: Build conditions array with soft delete filter
      const conditions: SQL[] = [
        eq(assets.isBulk, true),
        isNull(assetAssignment.deletedAt) // Exclude soft-deleted records
      ];

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

      const sortColumn =
        sortBy === "assetName"
          ? assets.name
          : sortBy === "assignedTo"
            ? sql`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`
            : sortBy === "assignedBy"
              ? sql`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`
              : assetAssignment.dateIssued;

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

      // ✅ UPDATED: Count with soft delete filter
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

      const transformedAssignments: AssignmentWithDetails[] = assignments.map(
        (assignment) => ({
          ...assignment,
          quantityReturned: 0,
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
        .where(and(
          eq(assetAssignment.assignmentId, assignmentId),
          isNull(assetAssignment.deletedAt) // Exclude soft-deleted records
        ))
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

  /**
   * ✅ NEW: Bulk delete assignments with transaction support
   */
  static async bulkDeleteAssignments(
    assignmentIds: number[],
    deletedBy: string,
    reason?: string
  ): Promise<{
    success: boolean;
    results: Array<{
      assignmentId: number;
      success: boolean;
      message?: string;
      error?: string;
      restoredAsset?: {
        assetId: number;
        name: string;
        newStatus: string;
        stockRestored?: number;
      };
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const results = [];
    let successCount = 0;

    // Process each assignment individually to ensure proper asset state management
    // Note: We could use a transaction here, but individual processing allows
    // partial success and better error handling per assignment
    for (const assignmentId of assignmentIds) {
      try {
        const result = await this.deleteAssignment(assignmentId, deletedBy, reason);
        
        if (result.success) {
          successCount++;
          results.push({
            assignmentId,
            success: true,
            message: result.message,
            restoredAsset: result.restoredAsset,
          });
        } else {
          results.push({
            assignmentId,
            success: false,
            error: result.message,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        results.push({
          assignmentId,
          success: false,
          error: errorMessage,
        });
      }
    }

    return {
      success: successCount > 0,
      results,
      summary: {
        total: assignmentIds.length,
        successful: successCount,
        failed: assignmentIds.length - successCount,
      },
    };
  }

  /**
   *  Get assignments that can be safely deleted (no returns yet)
   */
  static async getDeletableAssignments(filters: AssignmentFilters = {}) {
    try {
      const assignedToUser = alias(users, "assignedToUser");
      const assignedByUser = alias(users, "assignedByUser");

      // Build base conditions - only active assignments (not returned AND not soft-deleted)
      const conditions: SQL[] = [
        isNull(assetAssignment.dateReturned),
        isNull(assetAssignment.deletedAt) // Exclude soft-deleted records
      ];

      if (filters.assignedBy) {
        conditions.push(eq(assetAssignment.assignedBy, filters.assignedBy));
      }

      if (filters.assignedTo) {
        conditions.push(eq(assetAssignment.assignedTo, filters.assignedTo));
      }

      if (filters.search) {
        const searchCondition = or(
          like(assets.name, `%${filters.search}%`),
          like(assets.serialNumber, `%${filters.search}%`),
          like(
            sql`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`,
            `%${filters.search}%`,
          ),
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      const assignments = await db
        .select({
          assignmentId: assetAssignment.assignmentId,
          assetId: assetAssignment.assetId,
          assetName: assets.name,
          serialNumber: assets.serialNumber,
          isBulk: assets.isBulk,
          assignedTo: assetAssignment.assignedTo,
          assignedToName: sql<string>`${assignedToUser.firstName} || ' ' || ${assignedToUser.lastName}`,
          assignedBy: assetAssignment.assignedBy,
          assignedByName: sql<string>`${assignedByUser.firstName} || ' ' || ${assignedByUser.lastName}`,
          dateIssued: assetAssignment.dateIssued,
          quantity: assetAssignment.quantity,
          notes: assetAssignment.notes,
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
        .orderBy(desc(assetAssignment.dateIssued));

      return {
        success: true,
        data: assignments,
        count: assignments.length,
      };
    } catch (error) {
      console.error("Error fetching deletable assignments:", error);
      return { success: false, message: "Failed to fetch deletable assignments" };
    }
  }
}