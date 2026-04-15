import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, vaultImages, InsertVaultImage, referrals } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByReferralCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function ensureReferralCode(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await getUserById(userId);
  if (user?.referralCode) return user.referralCode;
  // Generate a short unique code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase() +
    Math.random().toString(36).substring(2, 6).toUpperCase();
  await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
  return code;
}

// ── Vault Images ────────────────────────────────────────────────────────────

export async function insertVaultImage(image: InsertVaultImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(vaultImages).values(image);
}

export async function getVaultImagesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(vaultImages)
    .where(eq(vaultImages.userId, userId))
    .orderBy(desc(vaultImages.createdAt));
}

export async function deleteVaultImage(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(vaultImages).where(eq(vaultImages.id, id)).limit(1);
  if (!result[0] || result[0].userId !== userId) throw new Error("Image not found or access denied");
  await db.delete(vaultImages).where(eq(vaultImages.id, id));
  return result[0];
}

// ── Referrals ───────────────────────────────────────────────────────────────

export async function createReferral(referrerId: number, refereeId: number, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Only create if referee doesn't already have a referral
  const existing = await getReferralByReferee(refereeId);
  if (existing) return;
  await db.insert(referrals).values({ referrerId, refereeId, code, status: "pending" });
}

export async function getReferralsByReferrer(referrerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, referrerId))
    .orderBy(desc(referrals.createdAt));
}

export async function getReferralByReferee(refereeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(referrals).where(eq(referrals.refereeId, refereeId)).limit(1);
  return result[0];
}

export async function markReferralPurchased(refereeId: number) {
  const db = await getDb();
  if (!db) return;
  const referral = await getReferralByReferee(refereeId);
  if (!referral || referral.status !== "pending") return;
  // Mark as purchased and reward referrer $1 (100 cents)
  await db.update(referrals).set({ status: "purchased" }).where(eq(referrals.refereeId, refereeId));
  const referrer = await getUserById(referral.referrerId);
  if (referrer) {
    const newBalance = (referrer.referralBalance ?? 0) + 100;
    await db.update(users).set({ referralBalance: newBalance }).where(eq(users.id, referral.referrerId));
    await db.update(referrals).set({ status: "rewarded", rewardPaid: true }).where(eq(referrals.refereeId, refereeId));
    console.log(`[Referral] Rewarded $1 to user ${referral.referrerId} for referring user ${refereeId}`);
  }
}
