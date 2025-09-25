ALTER TABLE "asset_assignment" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "asset_assignment" ADD COLUMN "deleted_by" varchar(50);--> statement-breakpoint
ALTER TABLE "asset_assignment" ADD COLUMN "deletion_reason" text;--> statement-breakpoint
ALTER TABLE "asset_assignment" ADD CONSTRAINT "asset_assignment_deleted_by_users_payroll_number_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("payroll_number") ON DELETE set null ON UPDATE no action;