CREATE TYPE "public"."report_category" AS ENUM('status', 'medical', 'food');--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "category" "report_category" DEFAULT 'status' NOT NULL;