import { pgTable, foreignKey, serial, varchar, integer, boolean, timestamp, numeric, text, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const bulkStatus = pgEnum("bulk_status", ['not_issued', 'issued', 'depleted'])
export const condition = pgEnum("condition", ['excellent', 'good', 'fair', 'poor', 'damaged'])
export const individualStatus = pgEnum("individual_status", ['available', 'in_use', 'maintenance', 'disposed'])
export const movementType = pgEnum("movement_type", ['transfer', 'assignment', 'return', 'adjustment', 'disposal'])
export const userRole = pgEnum("user_role", ['admin', 'keeper', 'viewer'])


export const assets = pgTable("assets", {
	assetId: serial("asset_id").primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	region: varchar({ length: 100 }).notNull(),
	keeperPayrollNumber: varchar("keeper_payroll_number", { length: 50 }),
	locationId: integer("location_id").notNull(),
	serialNumber: varchar("serial_number", { length: 100 }),
	isBulk: boolean("is_bulk").default(false).notNull(),
	individualStatus: individualStatus("individual_status"),
	bulkStatus: bulkStatus("bulk_status"),
	currentStockLevel: integer("current_stock_level"),
	modelNumber: varchar("model_number", { length: 100 }),
	purchaseDate: timestamp("purchase_date", { mode: 'string' }),
	purchaseCost: numeric("purchase_cost", { precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.keeperPayrollNumber],
			foreignColumns: [users.payrollNumber],
			name: "assets_keeper_payroll_number_users_payroll_number_fk"
		}),
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [locations.locationId],
			name: "assets_location_id_locations_location_id_fk"
		}),
]);

export const assetAssignment = pgTable("asset_assignment", {
	assignmentId: serial("assignment_id").primaryKey().notNull(),
	assetId: integer("asset_id").notNull(),
	assignedTo: varchar("assigned_to", { length: 50 }).notNull(),
	assignedBy: varchar("assigned_by", { length: 50 }).notNull(),
	dateIssued: timestamp("date_issued", { mode: 'string' }).defaultNow().notNull(),
	dateDue: timestamp("date_due", { mode: 'string' }),
	dateReturned: timestamp("date_returned", { mode: 'string' }),
	conditionIssued: condition("condition_issued").default('good').notNull(),
	conditionReturned: condition("condition_returned"),
	notes: text(),
	quantity: integer().default(1),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assetId],
			foreignColumns: [assets.assetId],
			name: "asset_assignment_asset_id_assets_asset_id_fk"
		}),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.payrollNumber],
			name: "asset_assignment_assigned_to_users_payroll_number_fk"
		}),
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [users.payrollNumber],
			name: "asset_assignment_assigned_by_users_payroll_number_fk"
		}),
]);

export const assetMovement = pgTable("asset_movement", {
	movementId: serial("movement_id").primaryKey().notNull(),
	assetId: integer("asset_id").notNull(),
	fromLocationId: integer("from_location_id"),
	toLocationId: integer("to_location_id"),
	movedBy: varchar("moved_by", { length: 50 }).notNull(),
	movementType: movementType("movement_type").default('transfer').notNull(),
	quantity: integer().default(1),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.assetId],
			foreignColumns: [assets.assetId],
			name: "asset_movement_asset_id_assets_asset_id_fk"
		}),
	foreignKey({
			columns: [table.fromLocationId],
			foreignColumns: [locations.locationId],
			name: "asset_movement_from_location_id_locations_location_id_fk"
		}),
	foreignKey({
			columns: [table.toLocationId],
			foreignColumns: [locations.locationId],
			name: "asset_movement_to_location_id_locations_location_id_fk"
		}),
	foreignKey({
			columns: [table.movedBy],
			foreignColumns: [users.payrollNumber],
			name: "asset_movement_moved_by_users_payroll_number_fk"
		}),
]);

export const locations = pgTable("locations", {
	locationId: serial("location_id").primaryKey().notNull(),
	regionName: varchar("region_name", { length: 100 }).notNull(),
	departmentName: varchar("department_name", { length: 100 }).notNull(),
	notes: varchar({ length: 200 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const assetStock = pgTable("asset_stock", {
	assetId: integer("asset_id").primaryKey().notNull(),
	quantity: integer().default(0).notNull(),
	assetName: varchar("asset_name", { length: 200 }).notNull(),
	keeperPayrollNumber: varchar("keeper_payroll_number", { length: 50 }),
	minimumThreshold: integer("minimum_threshold").default(0),
	maximumCapacity: integer("maximum_capacity"),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assetId],
			foreignColumns: [assets.assetId],
			name: "asset_stock_asset_id_assets_asset_id_fk"
		}),
	foreignKey({
			columns: [table.keeperPayrollNumber],
			foreignColumns: [users.payrollNumber],
			name: "asset_stock_keeper_payroll_number_users_payroll_number_fk"
		}),
]);

export const users = pgTable("users", {
	payrollNumber: varchar("payroll_number", { length: 50 }).primaryKey().notNull(),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }).notNull(),
	role: userRole().default('viewer').notNull(),
	password: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	mustChangePassword: boolean("must_change_password").default(false).notNull(),
});
