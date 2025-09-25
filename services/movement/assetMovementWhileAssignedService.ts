import { db } from "@/db/connection";
import {
  assets,
  assetMovement,
  assetAssignment,
  users,
  locations,
  type AssetMovement,
  type AssetAssignment,
} from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

// Types for service parameters and responses
export interface MoveAssignedAssetParams {
  assetId: number;
  toLocationId: number;
  movedBy: string;
  notes?: string;
}

export interface ReturnAssignedAssetParams {
  assetId: number;
  returnedBy: string;
  conditionReturned?: "excellent" | "good" | "fair" | "poor" | "damaged";
  quantityReturned?: number;
  notes?: string;
}

export interface MoveAssignedAssetResponse {
  success: boolean;
  message: string;
  movementId?: number;
  updatedAsset?: {
    assetId: number;
    name: string;
    serialNumber: string;
    newLocation: {
      locationId: number;
      regionName: string;
      departmentName: string;
    };
    currentAssignment: {
      assignedTo: string;
      assignedToName: string;
      dateIssued: Date;
    };
  };
}

export interface ReturnAssignedAssetResponse {
  success: boolean;
  message: string;
  returnedAssignment?: {
    assignmentId: number;
    assetId: number;
    assetName: string;
    serialNumber: string;
    assignedTo: string;
    assignedToName: string;
    dateIssued: Date;
    dateReturned: Date;
    conditionIssued: string;
    conditionReturned?: string;
    quantityIssued: number;
    quantityReturned: number;
  };
}

export class AssetAssignmentService {
  /**
   * Move an assigned asset to a new location while maintaining its assignment
   * Only keepers and admins can perform this action
   */
  static async moveAssignedAsset(
    params: MoveAssignedAssetParams
  ): Promise<MoveAssignedAssetResponse> {
    const { assetId, toLocationId, movedBy, notes } = params;

    try {
      return await db.transaction(async (tx) => {
        // 1. Verify the asset exists, is unique, and is currently assigned
        const assetQuery = await tx
          .select({
            assetId: assets.assetId,
            name: assets.name,
            serialNumber: assets.serialNumber,
            currentLocationId: assets.locationId,
            isBulk: assets.isBulk,
            individualStatus: assets.individualStatus,
            // Current assignment details
            assignmentId: assetAssignment.assignmentId,
            assignedTo: assetAssignment.assignedTo,
            assignedToFirstName: users.firstName,
            assignedToLastName: users.lastName,
            dateIssued: assetAssignment.dateIssued,
            // Current location details
            currentRegionName: locations.regionName,
            currentDepartmentName: locations.departmentName,
          })
          .from(assets)
          .innerJoin(
            assetAssignment,
            and(
              eq(assets.assetId, assetAssignment.assetId),
              isNull(assetAssignment.dateReturned) // Only active assignments
            )
          )
          .innerJoin(users, eq(assetAssignment.assignedTo, users.payrollNumber))
          .innerJoin(locations, eq(assets.locationId, locations.locationId))
          .where(eq(assets.assetId, assetId))
          .limit(1);

        if (assetQuery.length === 0) {
          return {
            success: false,
            message: "Asset not found, is not a unique asset, or is not currently assigned",
          };
        }

        const assetData = assetQuery[0];

        // 2. Verify the asset is a unique asset (not bulk)
        if (assetData.isBulk) {
          return {
            success: false,
            message: "Cannot move bulk assets using this endpoint",
          };
        }

        // 3. Verify the new location exists
        const newLocationQuery = await tx
          .select({
            locationId: locations.locationId,
            regionName: locations.regionName,
            departmentName: locations.departmentName,
          })
          .from(locations)
          .where(eq(locations.locationId, toLocationId))
          .limit(1);

        if (newLocationQuery.length === 0) {
          return {
            success: false,
            message: "Target location not found",
          };
        }

        const newLocation = newLocationQuery[0];

        // 4. Check if asset is already at the target location
        if (assetData.currentLocationId === toLocationId) {
          return {
            success: false,
            message: "Asset is already at the specified location",
          };
        }

        // 5. Verify the user performing the move exists
        const moverQuery = await tx
          .select({ payrollNumber: users.payrollNumber })
          .from(users)
          .where(eq(users.payrollNumber, movedBy))
          .limit(1);

        if (moverQuery.length === 0) {
          return {
            success: false,
            message: "Invalid user performing the move",
          };
        }

        // 6. Update the asset's location
        await tx
          .update(assets)
          .set({
            locationId: toLocationId,
            updatedAt: sql`NOW()`,
          })
          .where(eq(assets.assetId, assetId));

        // 7. Create a movement record
        const movementResult = await tx
          .insert(assetMovement)
          .values({
            assetId,
            fromLocationId: assetData.currentLocationId,
            toLocationId,
            movedBy,
            movementType: "transfer",
            quantity: 1,
            notes: notes || `Moved assigned asset from ${assetData.currentRegionName} - ${assetData.currentDepartmentName} to ${newLocation.regionName} - ${newLocation.departmentName}`,
          })
          .returning({ movementId: assetMovement.movementId });

        return {
          success: true,
          message: `Asset successfully moved to ${newLocation.regionName} - ${newLocation.departmentName}`,
          movementId: movementResult[0].movementId,
          updatedAsset: {
            assetId: assetData.assetId,
            name: assetData.name,
            serialNumber: assetData.serialNumber!,
            newLocation: {
              locationId: newLocation.locationId,
              regionName: newLocation.regionName,
              departmentName: newLocation.departmentName,
            },
            currentAssignment: {
              assignedTo: assetData.assignedTo,
              assignedToName: `${assetData.assignedToFirstName} ${assetData.assignedToLastName}`,
              dateIssued: assetData.dateIssued,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error moving assigned asset:", error);
      return {
        success: false,
        message: "Failed to move assigned asset due to an internal error",
      };
    }
  }
}