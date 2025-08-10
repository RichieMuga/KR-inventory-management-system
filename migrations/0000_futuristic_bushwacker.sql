CREATE TYPE "public"."bulk_status" AS ENUM('not_issued', 'issued', 'depleted');--> statement-breakpoint
CREATE TYPE "public"."condition" AS ENUM('excellent', 'good', 'fair', 'poor', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."individual_status" AS ENUM('available', 'in_use', 'maintenance', 'disposed');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('transfer', 'assignment', 'return', 'adjustment', 'disposal');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'keeper', 'viewer');--> statement-breakpoint
CREATE TABLE "asset_assignment" (
	"assignment_id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"assigned_to" varchar(50) NOT NULL,
	"assigned_by" varchar(50) NOT NULL,
	"date_issued" timestamp DEFAULT now() NOT NULL,
	"date_due" timestamp,
	"date_returned" timestamp,
	"condition_issued" "condition" DEFAULT 'good' NOT NULL,
	"condition_returned" "condition",
	"notes" text,
	"quantity" integer DEFAULT 1,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_movement" (
	"movement_id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"from_location_id" integer,
	"to_location_id" integer,
	"moved_by" varchar(50) NOT NULL,
	"movement_type" "movement_type" DEFAULT 'transfer' NOT NULL,
	"quantity" integer DEFAULT 1,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "asset_stock" (
	"asset_id" integer PRIMARY KEY NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"asset_name" varchar(200) NOT NULL,
	"keeper_payroll_number" varchar(50),
	"minimum_threshold" integer DEFAULT 0,
	"maximum_capacity" integer,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"asset_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"region" varchar(100) NOT NULL,
	"keeper_payroll_number" varchar(50),
	"location_id" integer NOT NULL,
	"serial_number" varchar(100),
	"is_bulk" boolean DEFAULT false NOT NULL,
	"individual_status" "individual_status",
	"bulk_status" "bulk_status",
	"current_stock_level" integer,
	"model_number" varchar(100),
	"purchase_date" timestamp,
	"purchase_cost" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"location_id" serial PRIMARY KEY NOT NULL,
	"region_name" varchar(100) NOT NULL,
	"department_name" varchar(100) NOT NULL,
	"notes" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"payroll_number" varchar(50) PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset_assignment" ADD CONSTRAINT "asset_assignment_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_assignment" ADD CONSTRAINT "asset_assignment_assigned_to_users_payroll_number_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("payroll_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_assignment" ADD CONSTRAINT "asset_assignment_assigned_by_users_payroll_number_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("payroll_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_movement" ADD CONSTRAINT "asset_movement_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_movement" ADD CONSTRAINT "asset_movement_from_location_id_locations_location_id_fk" FOREIGN KEY ("from_location_id") REFERENCES "public"."locations"("location_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_movement" ADD CONSTRAINT "asset_movement_to_location_id_locations_location_id_fk" FOREIGN KEY ("to_location_id") REFERENCES "public"."locations"("location_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_movement" ADD CONSTRAINT "asset_movement_moved_by_users_payroll_number_fk" FOREIGN KEY ("moved_by") REFERENCES "public"."users"("payroll_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_stock" ADD CONSTRAINT "asset_stock_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_stock" ADD CONSTRAINT "asset_stock_keeper_payroll_number_users_payroll_number_fk" FOREIGN KEY ("keeper_payroll_number") REFERENCES "public"."users"("payroll_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_keeper_payroll_number_users_payroll_number_fk" FOREIGN KEY ("keeper_payroll_number") REFERENCES "public"."users"("payroll_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_location_id_locations_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE no action ON UPDATE no action;