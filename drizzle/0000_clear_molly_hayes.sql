CREATE TYPE "public"."aid_status" AS ENUM('needs_aid', 'in_progress', 'aided');--> statement-breakpoint
CREATE TYPE "public"."flood_status" AS ENUM('flooded', 'safe', 'not_in_danger');--> statement-breakpoint
CREATE TYPE "public"."otp_purpose" AS ENUM('submit', 'update', 'admin');--> statement-breakpoint
CREATE TABLE "admin_allowlist" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_allowlist_phone_unique" UNIQUE("phone"),
	CONSTRAINT "admin_allowlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"purpose" "otp_purpose" NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"address" text,
	"flood_status" "flood_status" NOT NULL,
	"aid_status" "aid_status",
	"is_proxy" boolean DEFAULT false NOT NULL,
	"photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
