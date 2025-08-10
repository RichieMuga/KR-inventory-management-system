import {
  pgTable,
  serial,
  varchar,
  boolean,
  integer,
  timestamp,
  text,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums for better type safety
export const userRoleEnum = pgEnum("user_role", ["admin", "keeper", "viewer"]);

export const individualStatusEnum = pgEnum("individual_status", [
  "available",
  "in_use",
  "maintenance",
  "disposed",
]);

export const bulkStatusEnum = pgEnum("bulk_status", [
  "not_issued",
  "issued",
  "depleted",
]);

export const movementTypeEnum = pgEnum("movement_type", [
  "transfer",
  "assignment",
  "return",
  "adjustment",
  "disposal",
]);

export const conditionEnum = pgEnum("condition", [
  "excellent",
  "good",
  "fair",
  "poor",
  "damaged",
]);

// Users table
export const users = pgTable("users", {
  payrollNumber: varchar("payroll_number", { length: 50 }).primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").notNull().default("viewer"),
  password: varchar("password", { length: 255 }).notNull(),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Locations table
export const locations = pgTable("locations", {
  locationId: serial("location_id").primaryKey(),
  regionName: varchar("region_name", { length: 100 }).notNull(),
  departmentName: varchar("department_name", { length: 100 }).notNull(),
  notes: varchar("notes", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Assets table with improved status handling
export const assets = pgTable("assets", {
  assetId: serial("asset_id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  keeperPayrollNumber: varchar("keeper_payroll_number", {
    length: 50,
  }).references(() => users.payrollNumber),
  locationId: integer("location_id")
    .references(() => locations.locationId)
    .notNull(),
  serialNumber: varchar("serial_number", { length: 100 }), // Nullable for bulk items
  isBulk: boolean("is_bulk").notNull().default(false),

  // Status fields - only one should be populated based on isBulk
  individualStatus: individualStatusEnum("individual_status"), // For individual assets
  bulkStatus: bulkStatusEnum("bulk_status"), // For bulk assets
  currentStockLevel: integer("current_stock_level"), // For bulk assets only

  // Additional useful fields
  modelNumber: varchar("model_number", { length: 100 }),
  purchaseDate: timestamp("purchase_date"),
  purchaseCost: decimal("purchase_cost", { precision: 10, scale: 2 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Asset Stock table (for bulk inventory tracking)
export const assetStock = pgTable("asset_stock", {
  assetId: integer("asset_id")
    .references(() => assets.assetId)
    .primaryKey(),
  quantity: integer("quantity").notNull().default(0),
  assetName: varchar("asset_name", { length: 200 }).notNull(),
  keeperPayrollNumber: varchar("keeper_payroll_number", {
    length: 50,
  }).references(() => users.payrollNumber),
  minimumThreshold: integer("minimum_threshold").default(0),
  maximumCapacity: integer("maximum_capacity"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Asset Movement table
export const assetMovement = pgTable("asset_movement", {
  movementId: serial("movement_id").primaryKey(),
  assetId: integer("asset_id")
    .references(() => assets.assetId)
    .notNull(),
  fromLocationId: integer("from_location_id").references(
    () => locations.locationId,
  ),
  toLocationId: integer("to_location_id").references(
    () => locations.locationId,
  ),
  movedBy: varchar("moved_by", { length: 50 })
    .references(() => users.payrollNumber)
    .notNull(),
  movementType: movementTypeEnum("movement_type").notNull().default("transfer"),
  quantity: integer("quantity").default(1), // For bulk items
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
});

// Asset Assignment table
export const assetAssignment = pgTable("asset_assignment", {
  assignmentId: serial("assignment_id").primaryKey(),
  assetId: integer("asset_id")
    .references(() => assets.assetId)
    .notNull(),
  assignedTo: varchar("assigned_to", { length: 50 })
    .references(() => users.payrollNumber)
    .notNull(),
  assignedBy: varchar("assigned_by", { length: 50 })
    .references(() => users.payrollNumber)
    .notNull(),
  dateIssued: timestamp("date_issued").defaultNow().notNull(),
  dateDue: timestamp("date_due"),
  dateReturned: timestamp("date_returned"),
  conditionIssued: conditionEnum("condition_issued").notNull().default("good"),
  conditionReturned: conditionEnum("condition_returned"),
  notes: text("notes"),
  quantity: integer("quantity").default(1), // For bulk assignments
  isActive: boolean("is_active").notNull().default(true),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedAssets: many(assets),
  stockAssets: many(assetStock),
  movements: many(assetMovement),
  assignmentsGiven: many(assetAssignment, { relationName: "assignedBy" }),
  assignmentsReceived: many(assetAssignment, { relationName: "assignedTo" }),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  assets: many(assets),
  movementsFrom: many(assetMovement, { relationName: "fromLocation" }),
  movementsTo: many(assetMovement, { relationName: "toLocation" }),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  keeper: one(users, {
    fields: [assets.keeperPayrollNumber],
    references: [users.payrollNumber],
  }),
  location: one(locations, {
    fields: [assets.locationId],
    references: [locations.locationId],
  }),
  stock: one(assetStock, {
    fields: [assets.assetId],
    references: [assetStock.assetId],
  }),
  movements: many(assetMovement),
  assignments: many(assetAssignment),
}));

export const assetStockRelations = relations(assetStock, ({ one }) => ({
  asset: one(assets, {
    fields: [assetStock.assetId],
    references: [assets.assetId],
  }),
  keeper: one(users, {
    fields: [assetStock.keeperPayrollNumber],
    references: [users.payrollNumber],
  }),
}));

export const assetMovementRelations = relations(assetMovement, ({ one }) => ({
  asset: one(assets, {
    fields: [assetMovement.assetId],
    references: [assets.assetId],
  }),
  fromLocation: one(locations, {
    fields: [assetMovement.fromLocationId],
    references: [locations.locationId],
    relationName: "fromLocation",
  }),
  toLocation: one(locations, {
    fields: [assetMovement.toLocationId],
    references: [locations.locationId],
    relationName: "toLocation",
  }),
  movedByUser: one(users, {
    fields: [assetMovement.movedBy],
    references: [users.payrollNumber],
  }),
}));

export const assetAssignmentRelations = relations(
  assetAssignment,
  ({ one }) => ({
    asset: one(assets, {
      fields: [assetAssignment.assetId],
      references: [assets.assetId],
    }),
    assignedToUser: one(users, {
      fields: [assetAssignment.assignedTo],
      references: [users.payrollNumber],
      relationName: "assignedTo",
    }),
    assignedByUser: one(users, {
      fields: [assetAssignment.assignedBy],
      references: [users.payrollNumber],
      relationName: "assignedBy",
    }),
  }),
);

// Type exports for use in your application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;

export type AssetStock = typeof assetStock.$inferSelect;
export type NewAssetStock = typeof assetStock.$inferInsert;

export type AssetMovement = typeof assetMovement.$inferSelect;
export type NewAssetMovement = typeof assetMovement.$inferInsert;

export type AssetAssignment = typeof assetAssignment.$inferSelect;
export type NewAssetAssignment = typeof assetAssignment.$inferInsert;
