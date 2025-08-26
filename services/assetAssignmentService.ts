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
}

export class AssetAssignmentService {
  /**
   * Create a new asset assignment (works for both unique and bulk assets)
   */

  static async createAssignment(
    data: CreateAssignmentData,
  ): Promise<{ success: boolean; assignmentId?: number; message: string }> {
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

        // Check if already assigned (no return date)
        const existingAssignment = await db
          .select({ assignmentId: assetAssignment.assignmentId })
          .from(assetAssignment)
          .where(
            and(
              eq(assetAssignment.assetId, data.assetId),
              isNull(assetAssignment.dateReturned), // isNull is now properly imported
            ),
          )
          .limit(1);

        if (existingAssignment.length > 0) {
          return { success: false, message: "Asset is already assigned" };
        }
      } else {
        // Bulk asset stock validation
        if (
          !assetDetails.currentStockLevel ||
          assetDetails.currentStockLevel < data.quantity
        ) {
          return { success: false, message: "Insufficient stock available" };
        }

        // Update stock level
        await db
          .update(assets)
          .set({
            currentStockLevel: sql`${assets.currentStockLevel} - ${data.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(assets.assetId, data.assetId));
      }

      // Create the assignment - FIXED: Use proper type for conditionIssued
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
        .returning({ assignmentId: assetAssignment.assignmentId });

      // Update asset location and keeper
      await db
        .update(assets)
        .set({
          locationId: targetLocationId,
          keeperPayrollNumber: data.assignedTo, // Person becomes responsible
          individualStatus: !assetDetails.isBulk
            ? "in_use"
            : assetDetails.individualStatus,
          updatedAt: new Date(),
        })
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

      return {
        success: true,
        assignmentId: newAssignment.assignmentId,
        message: `Asset assigned successfully to ${userDetails.firstName} ${userDetails.lastName}${assetDetails.locationId !== targetLocationId
            ? ` and moved to ${userDetails.defaultLocation?.departmentName}`
            : ""
          }`,
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
