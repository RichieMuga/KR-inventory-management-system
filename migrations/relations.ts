import { relations } from "drizzle-orm/relations";
import { users, assets, locations, assetAssignment, assetMovement, assetStock } from "./schema";

export const assetsRelations = relations(assets, ({one, many}) => ({
	user: one(users, {
		fields: [assets.keeperPayrollNumber],
		references: [users.payrollNumber]
	}),
	location: one(locations, {
		fields: [assets.locationId],
		references: [locations.locationId]
	}),
	assetAssignments: many(assetAssignment),
	assetMovements: many(assetMovement),
	assetStocks: many(assetStock),
}));

export const usersRelations = relations(users, ({many}) => ({
	assets: many(assets),
	assetAssignments_assignedTo: many(assetAssignment, {
		relationName: "assetAssignment_assignedTo_users_payrollNumber"
	}),
	assetAssignments_assignedBy: many(assetAssignment, {
		relationName: "assetAssignment_assignedBy_users_payrollNumber"
	}),
	assetMovements: many(assetMovement),
	assetStocks: many(assetStock),
}));

export const locationsRelations = relations(locations, ({many}) => ({
	assets: many(assets),
	assetMovements_fromLocationId: many(assetMovement, {
		relationName: "assetMovement_fromLocationId_locations_locationId"
	}),
	assetMovements_toLocationId: many(assetMovement, {
		relationName: "assetMovement_toLocationId_locations_locationId"
	}),
}));

export const assetAssignmentRelations = relations(assetAssignment, ({one}) => ({
	asset: one(assets, {
		fields: [assetAssignment.assetId],
		references: [assets.assetId]
	}),
	user_assignedTo: one(users, {
		fields: [assetAssignment.assignedTo],
		references: [users.payrollNumber],
		relationName: "assetAssignment_assignedTo_users_payrollNumber"
	}),
	user_assignedBy: one(users, {
		fields: [assetAssignment.assignedBy],
		references: [users.payrollNumber],
		relationName: "assetAssignment_assignedBy_users_payrollNumber"
	}),
}));

export const assetMovementRelations = relations(assetMovement, ({one}) => ({
	asset: one(assets, {
		fields: [assetMovement.assetId],
		references: [assets.assetId]
	}),
	location_fromLocationId: one(locations, {
		fields: [assetMovement.fromLocationId],
		references: [locations.locationId],
		relationName: "assetMovement_fromLocationId_locations_locationId"
	}),
	location_toLocationId: one(locations, {
		fields: [assetMovement.toLocationId],
		references: [locations.locationId],
		relationName: "assetMovement_toLocationId_locations_locationId"
	}),
	user: one(users, {
		fields: [assetMovement.movedBy],
		references: [users.payrollNumber]
	}),
}));

export const assetStockRelations = relations(assetStock, ({one}) => ({
	asset: one(assets, {
		fields: [assetStock.assetId],
		references: [assets.assetId]
	}),
	user: one(users, {
		fields: [assetStock.keeperPayrollNumber],
		references: [users.payrollNumber]
	}),
}));