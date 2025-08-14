CREATE TYPE "public"."bulk_status" AS ENUM('active', 'out_of_stock', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."condition" AS ENUM('excellent', 'good', 'fair', 'poor', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."individual_status" AS ENUM('in_use', 'not_in_use', 'retired');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('transfer', 'assignment', 'adjustment', 'disposal');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'keeper', 'viewer');--> statement-breakpoint
CREATE TABLE "asset_assignment" (
	"assignment_id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"assigned_to" varchar(50) NOT NULL,
	"assigned_by" varchar(50) NOT NULL,
	"date_issued" timestamp DEFAULT now() NOT NULL,
	"condition_issued" "condition" DEFAULT 'good' NOT NULL,
	"notes" text,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_movement" (
	"movement_id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"from_location_id" integer,
	"to_location_id" integer NOT NULL,
	"moved_by" varchar(50) NOT NULL,
	"movement_type" "movement_type" DEFAULT 'transfer' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"asset_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"keeper_payroll_number" varchar(50),
	"location_id" integer NOT NULL,
	"serial_number" varchar(100),
	"is_bulk" boolean DEFAULT false NOT NULL,
	"individual_status" "individual_status",
	"bulk_status" "bulk_status",
	"current_stock_level" integer,
	"minimum_threshold" integer DEFAULT 0,
	"last_restocked" timestamp,
	"model_number" varchar(100),
	"notes" text,
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
CREATE TABLE "restock_log" (
	"log_id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"quantity_restocked" integer NOT NULL,
	"restocked_by" varchar(50) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"payroll_number" varchar(50) PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"password" varchar(255) NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset_assignment" ADD CONSTRAINT "asset_assignment_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_assignment" ADD CONSTRAINT "asset_assignment_assigned_to_users_payroll_number_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("payroll_number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_assignment" ADD CONSTRAINT "asset_assignment_assigned_by_users_payroll_number_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("payroll_number") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_movement" ADD CONSTRAINT "asset_movement_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_movement" ADD CONSTRAINT "asset_movement_from_location_id_locations_location_id_fk" FOREIGN KEY ("from_location_id") REFERENCES "public"."locations"("location_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_movement" ADD CONSTRAINT "asset_movement_to_location_id_locations_location_id_fk" FOREIGN KEY ("to_location_id") REFERENCES "public"."locations"("location_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_movement" ADD CONSTRAINT "asset_movement_moved_by_users_payroll_number_fk" FOREIGN KEY ("moved_by") REFERENCES "public"."users"("payroll_number") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_keeper_payroll_number_users_payroll_number_fk" FOREIGN KEY ("keeper_payroll_number") REFERENCES "public"."users"("payroll_number") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_location_id_locations_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restock_log" ADD CONSTRAINT "restock_log_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restock_log" ADD CONSTRAINT "restock_log_restocked_by_users_payroll_number_fk" FOREIGN KEY ("restocked_by") REFERENCES "public"."users"("payroll_number") ON DELETE set null ON UPDATE no action;