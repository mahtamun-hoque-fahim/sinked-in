import {
  pgTable,
  text,
  timestamp,
  numeric,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Flood status is a separate state machine from aid status.
// Do not collapse these into one field. See BRAIN.md § Context Hooks.
export const floodStatusEnum = pgEnum("flood_status", [
  "flooded",
  "safe",
  "not_in_danger",
]);

export const aidStatusEnum = pgEnum("aid_status", [
  "needs_aid",
  "in_progress",
  "aided",
]);

export const otpPurposeEnum = pgEnum("otp_purpose", [
  "submit",
  "update",
  "admin",
]);

// Category controls map pin color for showcase/triage purposes.
// status = yellow (sinked/flooded report)
// medical = red (needs medical assistance)
// food = blue (needs food/supplies)
export const reportCategoryEnum = pgEnum("report_category", [
  "status",
  "medical",
  "food",
]);

export const reports = pgTable("reports", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  address: text("address"),
  floodStatus: floodStatusEnum("flood_status").notNull(),
  aidStatus: aidStatusEnum("aid_status"),
  category: reportCategoryEnum("category").notNull().default("status"),
  isProxy: boolean("is_proxy").notNull().default(false),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  // Hashed with OTP_HASH_SECRET as pepper. Never stored plaintext.
  codeHash: text("code_hash").notNull(),
  purpose: otpPurposeEnum("purpose").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  // Null until used. A consumed code cannot be reused (prevents replay).
  // A token from purpose "submit" is not valid for "update" or "admin" —
  // every status change requires a fresh OTP. See AGENTS.md Conventions.
  consumedAt: timestamp("consumed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminAllowlist = pgTable("admin_allowlist", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  phone: text("phone").notNull().unique(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type OtpCode = typeof otpCodes.$inferSelect;
export type AdminAllowlistEntry = typeof adminAllowlist.$inferSelect;
