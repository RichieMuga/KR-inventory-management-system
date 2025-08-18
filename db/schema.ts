import {
  pgTable,
  serial,
  varchar,
  boolean,
  integer,
  timestamp,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// === ENUMS ===
export const userRoleEnum = pgEnum("user_role", ["admin", "keeper", "viewer"]);

export const individualStatusEnum = pgEnum("individual_status", [
  "in_use",
  "not_in_use",
  "retired",
]);

export const bulkStatusEnum = pgEnum("bulk_status", [
  "active",
  "out_of_stock",
  "discontinued",
]);

export const movementTypeEnum = pgEnum("movement_type", [
  "transfer",
  "assignment",
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

// === TABLES ===

/**
 * Users who interact with the system
 */
export const users = pgTable("users", {
  payrollNumber: varchar("payroll_number", { length: 50 }).primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").notNull().default("viewer"),
  password: varchar("password", { length: 255 }).notNull(),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Physical or logical locations (e.g., departments, regions)
 */
export const locations = pgTable("locations", {
  locationId: serial("location_id").primaryKey(),
  regionName: varchar("region_name", { length: 100 }).notNull(),
  departmentName: varchar("department_name", { length: 100 }).notNull(),
  notes: varchar("notes", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Assets — both unique (individual) and bulk (stocked)
 *
 * Key design: `isBulk` determines which fields are used.
 *
 * Constraints:
 * - Unique assets: require `serialNumber`, `individualStatus`
 * - Bulk assets: use `currentStockLevel`, `bulkStatus`, `minimumThreshold`
 */

// Updated constraint in your schema.ts
export const assets = pgTable(
  "assets",
  {
    assetId: serial("asset_id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    keeperPayrollNumber: varchar("keeper_payroll_number", {
      length: 50,
    }).references(() => users.payrollNumber, { onDelete: "set null" }),
    locationId: integer("location_id")
      .notNull()
      .references(() => locations.locationId, { onDelete: "cascade" }),
    serialNumber: varchar("serial_number", { length: 100 }),
    isBulk: boolean("is_bulk").notNull().default(false),

    // === Unique Asset Fields ===
    individualStatus: individualStatusEnum("individual_status"),

    // === Bulk Asset Fields ===
    bulkStatus: bulkStatusEnum("bulk_status"),
    currentStockLevel: integer("current_stock_level"),
    minimumThreshold: integer("minimum_threshold").default(0),
    lastRestocked: timestamp("last_restocked"),

    // === Shared Optional Fields ===
    modelNumber: varchar("model_number", { length: 100 }),
    notes: text("notes"), // Add this field if it's missing

    // === Timestamps ===
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // 🔐 Constraint: serialNumber is required for non-bulk (unique) assets
    serialNumberRequiredForUnique: sql`
      CHECK (
        (is_bulk = true) OR 
        (is_bulk = false AND serial_number IS NOT NULL)
      )
    `,

    // 🔐 Constraint: individualStatus only for non-bulk
    individualStatusOnlyForUnique: sql`
      CHECK (
        (is_bulk = true AND individual_status IS NULL) OR
        (is_bulk = false)
      )
    `,

    // 🔐 FIXED Constraint: bulk fields only for bulk assets
    bulkFieldsOnlyForBulk: sql`
      CHECK (
        (is_bulk = false AND 
         bulk_status IS NULL AND 
         current_stock_level IS NULL AND 
         (minimum_threshold IS NULL OR minimum_threshold = 0) AND 
         last_restocked IS NULL
        ) OR
        (is_bulk = true)
      )
    `,
  }),
);

/**
 * Tracks all movements of assets (transfers, assignments, disposal)
 */
export const assetMovement = pgTable("asset_movement", {
  movementId: serial("movement_id").primaryKey(),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assets.assetId, { onDelete: "cascade" }),
  fromLocationId: integer("from_location_id").references(
    () => locations.locationId,
    { onDelete: "set null" },
  ),
  toLocationId: integer("to_location_id")
    .notNull()
    .references(() => locations.locationId, { onDelete: "cascade" }),
  movedBy: varchar("moved_by", { length: 50 })
    .notNull()
    .references(() => users.payrollNumber, { onDelete: "set null" }),
  movementType: movementTypeEnum("movement_type").notNull().default("transfer"),
  quantity: integer("quantity").notNull().default(1),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
});

/**
 * Tracks assignment of assets to users (especially useful for unique assets)
 */
export const assetAssignment = pgTable("asset_assignment", {
  assignmentId: serial("assignment_id").primaryKey(),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assets.assetId, { onDelete: "cascade" }),
  assignedTo: varchar("assigned_to", { length: 50 })
    .notNull()
    .references(() => users.payrollNumber, { onDelete: "cascade" }),
  assignedBy: varchar("assigned_by", { length: 50 })
    .notNull()
    .references(() => users.payrollNumber, { onDelete: "set null" }),
  dateIssued: timestamp("date_issued").defaultNow().notNull(),
  conditionIssued: conditionEnum("condition_issued").notNull().default("good"),
  notes: text("notes"),
  quantity: integer("quantity").notNull().default(1),
  dateReturned: timestamp("date_returned"), // For tracking when asset was returned
  conditionReturned: conditionEnum("condition_returned"), // Condition when returned
  quantityReturned: integer("quantity_returned").default(0),
});

/**
 * Logs restocking events for bulk assets
 */
export const restockLog = pgTable("restock_log", {
  logId: serial("log_id").primaryKey(),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assets.assetId, { onDelete: "cascade" }),
  quantityRestocked: integer("quantity_restocked").notNull(),
  restockedBy: varchar("restocked_by", { length: 50 })
    .notNull()
    .references(() => users.payrollNumber, { onDelete: "set null" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  assets: many(assets, { relationName: "keeper" }),
  movements: many(assetMovement, { relationName: "movedByUser" }),
  assignmentsGiven: many(assetAssignment, { relationName: "assignedBy" }),
  assignmentsReceived: many(assetAssignment, { relationName: "assignedTo" }),
  restockLogs: many(restockLog),
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
    relationName: "keeper",
  }),
  location: one(locations, {
    fields: [assets.locationId],
    references: [locations.locationId],
  }),
  movements: many(assetMovement),
  assignments: many(assetAssignment),
  restockLogs: many(restockLog),
}));

export const assetMovementRelations = relations(assetMovement, ({ one }) => ({
  asset: one(assets, {
    fields: [assetMovement.assetId],
    references: [assets.assetId],
  }),
  movedByUser: one(users, {
    fields: [assetMovement.movedBy],
    references: [users.payrollNumber],
    relationName: "movedByUser",
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

export const restockLogRelations = relations(restockLog, ({ one }) => ({
  asset: one(assets, {
    fields: [restockLog.assetId],
    references: [assets.assetId],
  }),
  restocker: one(users, {
    fields: [restockLog.restockedBy],
    references: [users.payrollNumber],
  }),
}));

// === TYPE EXPORTS ===
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;

export type AssetMovement = typeof assetMovement.$inferSelect;
export type NewAssetMovement = typeof assetMovement.$inferInsert;

export type AssetAssignment = typeof assetAssignment.$inferSelect;
export type NewAssetAssignment = typeof assetAssignment.$inferInsert;

export type RestockLog = typeof restockLog.$inferSelect;
export type NewRestockLog = typeof restockLog.$inferInsert;
