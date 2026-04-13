import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  /** Whether the user has completed the one-time purchase */
  hasPurchased: boolean("hasPurchased").default(false).notNull(),
  /** Stripe Payment Intent ID for audit */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  /** Unique referral code for this user (generated on first login) */
  referralCode: varchar("referralCode", { length: 32 }).unique(),
  /** Accumulated referral reward balance in cents (e.g. 500 = $5.00) */
  referralBalance: int("referralBalance").default(0).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vault images — metadata for images uploaded to S3 by a user.
 * The actual bytes live in S3; only the reference is stored here.
 */
export const vaultImages = mysqlTable("vaultImages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** S3 object key (relative path) */
  s3Key: varchar("s3Key", { length: 512 }).notNull(),
  /** Public CDN URL returned by storagePut */
  url: text("url").notNull(),
  /** Original filename provided by the user */
  name: varchar("name", { length: 255 }).notNull(),
  /** File size in bytes */
  size: bigint("size", { mode: "number" }).notNull(),
  /** MIME type e.g. image/jpeg */
  mimeType: varchar("mimeType", { length: 64 }).notNull(),
  /** Optional album/category name for grouping images */
  album: varchar("album", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VaultImage = typeof vaultImages.$inferSelect;
export type InsertVaultImage = typeof vaultImages.$inferInsert;

/**
 * Referrals — tracks who invited whom and whether the reward was paid.
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  /** The user who shared their referral code */
  referrerId: int("referrerId").notNull(),
  /** The user who signed up using the referral code */
  refereeId: int("refereeId").notNull().unique(),
  /** The referral code that was used */
  code: varchar("code", { length: 32 }).notNull(),
  /** Status of the referral */
  status: mysqlEnum("status", ["pending", "purchased", "rewarded"]).default("pending").notNull(),
  /** Whether the $5 reward has been paid out */
  rewardPaid: boolean("rewardPaid").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;
