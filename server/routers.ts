import Stripe from "stripe";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getDb,
  getUserByReferralCode,
  ensureReferralCode,
  insertVaultImage,
  getVaultImagesByUser,
  deleteVaultImage,
  getReferralsByReferrer,
  createReferral,
} from "./db";
import { referrals as referralsTable, users } from "../drizzle/schema";
import { PRODUCTS } from "./products";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// Helper: generate a random suffix for S3 keys to prevent enumeration
function randomSuffix() {
  return Math.random().toString(36).substring(2, 10);
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  payment: router({
    /** Check if the current user has purchased vault access */
    status: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { hasPurchased: false };
      const result = await db
        .select({ hasPurchased: users.hasPurchased })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);
      return { hasPurchased: result[0]?.hasPurchased ?? false };
    }),

    /** Create a Stripe Checkout Session for the one-time vault purchase */
    createCheckoutSession: protectedProcedure
      .input(z.object({ origin: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const product = PRODUCTS.VAULT_ACCESS;
        const session = await stripe.checkout.sessions.create({
          mode: product.mode,
          payment_method_types: ["card"],
          allow_promotion_codes: true,
          customer_email: ctx.user.email ?? undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email ?? "",
            customer_name: ctx.user.name ?? "",
          },
          line_items: [
            {
              price_data: {
                currency: product.currency,
                unit_amount: product.price,
                product_data: {
                  name: product.name,
                  description: product.description,
                },
              },
              quantity: 1,
            },
          ],
          success_url: `${input.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}/`,
        });
        return { url: session.url };
      }),

    /**
     * Check if the 30-day money-back guarantee is still valid for the current user.
     * The guarantee is VOIDED if the user received a referral reward within their first 30 days.
     */
    refundEligibility: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { eligible: true, reason: null };

      // Get user's purchase date
      const userRow = await db
        .select({ createdAt: users.createdAt, hasPurchased: users.hasPurchased })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!userRow[0]?.hasPurchased) {
        return { eligible: false, reason: "no_purchase" };
      }

      const purchaseDate = userRow[0].createdAt;
      const thirtyDaysAfterPurchase = new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const now = new Date();

      // Check if 30-day window has already expired
      if (now > thirtyDaysAfterPurchase) {
        return { eligible: false, reason: "window_expired" };
      }

      // Check if user received a referral reward within the first 30 days
      const rewardedReferrals = await db
        .select()
        .from(referralsTable)
        .where(eq(referralsTable.referrerId, ctx.user.id));

      const rewardReceivedInWindow = rewardedReferrals.some(
        (r) =>
          r.status === "rewarded" &&
          r.rewardPaid === true &&
          new Date(r.updatedAt) <= thirtyDaysAfterPurchase
      );

      if (rewardReceivedInWindow) {
        return {
          eligible: false,
          reason: "referral_reward_received",
          message:
            "Your 30-day money-back guarantee is no longer valid because you received a referral reward within your first 30 days of purchase.",
        };
      }

      const daysRemaining = Math.ceil(
        (thirtyDaysAfterPurchase.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return { eligible: true, reason: null, daysRemaining };
    }),

    /** Fetch the user's Stripe payment history */
    orders: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { orders: [] };

      const userRow = await db
        .select({ stripePaymentIntentId: users.stripePaymentIntentId, email: users.email })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      const userEmail = userRow[0]?.email;
      if (!userEmail) return { orders: [] };

      try {
        const sessions = await stripe.checkout.sessions.list({ limit: 20 });
        const userSessions = sessions.data.filter(
          (s) =>
            s.metadata?.user_id === ctx.user.id.toString() ||
            s.customer_email === userEmail
        );

        const orders = userSessions
          .filter((s) => s.payment_status === "paid")
          .map((s) => ({
            id: s.id,
            amount: s.amount_total ?? 0,
            currency: s.currency ?? "usd",
            status: s.payment_status,
            date: s.created * 1000,
            productName: PRODUCTS.VAULT_ACCESS.name,
            receiptUrl: null as string | null,
          }));

        const enriched = await Promise.all(
          orders.map(async (order) => {
            try {
              const session = userSessions.find((s) => s.id === order.id);
              if (session?.payment_intent && typeof session.payment_intent === "string") {
                const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
                  expand: ["latest_charge"],
                });
                const charge = pi.latest_charge as Stripe.Charge | null;
                return { ...order, receiptUrl: charge?.receipt_url ?? null };
              }
            } catch { /* ignore enrichment errors */ }
            return order;
          })
        );

        return { orders: enriched };
      } catch {
        return { orders: [] };
      }
    }),
  }),

  // ── Image Vault ─────────────────────────────────────────────────────────

  images: router({
    /** List all vault images for the current user */
    list: protectedProcedure.query(async ({ ctx }) => {
      const images = await getVaultImagesByUser(ctx.user.id);
      return { images };
    }),

    /** Upload an image: accepts base64-encoded data + metadata */
    upload: protectedProcedure
      .input(
        z.object({
          name: z.string().max(255),
          mimeType: z.string().max(64),
          size: z.number().max(10 * 1024 * 1024), // 10 MB limit
          dataBase64: z.string(), // base64-encoded file bytes
          album: z.string().max(100).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"].includes(input.mimeType)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported image type." });
        }
        const buffer = Buffer.from(input.dataBase64, "base64");
        const ext = input.name.split(".").pop() ?? "jpg";
        const s3Key = `vault-images/${ctx.user.id}/${randomSuffix()}-${Date.now()}.${ext}`;
        const { url } = await storagePut(s3Key, buffer, input.mimeType);
        await insertVaultImage({
          userId: ctx.user.id,
          s3Key,
          url,
          name: input.name,
          size: input.size,
          mimeType: input.mimeType,
          album: input.album ?? undefined,
        });
        return { success: true, url };
      }),

    /** Delete an image by ID (only the owner can delete) */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteVaultImage(input.id, ctx.user.id);
        return { success: true };
      }),

    /** Move an image to a different album (or clear it) */
    setAlbum: protectedProcedure
      .input(z.object({ id: z.number(), album: z.string().max(100).nullable() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
        const { vaultImages: vaultImagesTable } = await import("../drizzle/schema");
        const rows = await db.select().from(vaultImagesTable).where(eq(vaultImagesTable.id, input.id)).limit(1);
        if (!rows[0] || rows[0].userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Not your image" });
        await db.update(vaultImagesTable).set({ album: input.album ?? undefined }).where(eq(vaultImagesTable.id, input.id));
        return { success: true };
      }),
  }),

  // ── Admin ──────────────────────────────────────────────────────────────────

  admin: router({
    /** Overview stats for the owner dashboard */
    stats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { totalUsers: 0, paidUsers: 0, totalReferrals: 0, rewardedReferrals: 0, pendingPayouts: 0 };
      const allUsers = await db.select().from(users);
      const allReferrals = await db.select().from(referralsTable);
      const totalUsers = allUsers.length;
      const paidUsers = allUsers.filter((u) => u.hasPurchased).length;
      const totalReferrals = allReferrals.length;
      const rewardedReferrals = allReferrals.filter((r) => r.status === "rewarded").length;
      const pendingPayouts = allUsers.filter((u) => (u.referralBalance ?? 0) > 0).length;
      return { totalUsers, paidUsers, totalReferrals, rewardedReferrals, pendingPayouts };
    }),

    /** List all users with key fields */
    users: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { users: [] };
      const allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          hasPurchased: users.hasPurchased,
          referralBalance: users.referralBalance,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
          role: users.role,
        })
        .from(users)
        .orderBy(desc(users.createdAt));
      return { users: allUsers };
    }),

    /** List all referrals for the admin */
    referrals: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { referrals: [] };
      const allReferrals = await db
        .select()
        .from(referralsTable)
        .orderBy(desc(referralsTable.createdAt));
      return { referrals: allReferrals };
    }),
  }),

  // ── Referrals ────────────────────────────────────────────────────────────

  referral: router({
    /** Get or generate the current user's referral code + stats */
    myCode: protectedProcedure.query(async ({ ctx }) => {
      const code = await ensureReferralCode(ctx.user.id);
      const referrals = await getReferralsByReferrer(ctx.user.id);
      const db = await getDb();
      let balance = 0;
      if (db) {
        const row = await db
          .select({ referralBalance: users.referralBalance })
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);
        balance = row[0]?.referralBalance ?? 0;
      }
      return {
        code,
        referralUrl: "", // will be constructed on the frontend using window.location.origin
        totalInvites: referrals.length,
        rewarded: referrals.filter((r) => r.status === "rewarded").length,
        pending: referrals.filter((r) => r.status === "pending").length,
        balanceCents: balance,
      };
    }),

    /** Called when a new user lands on the app via a referral link — records the referral */
    trackVisit: publicProcedure
      .input(z.object({ code: z.string(), refereeId: z.number() }))
      .mutation(async ({ input }) => {
        const referrer = await getUserByReferralCode(input.code);
        if (!referrer) return { success: false };
        if (referrer.id === input.refereeId) return { success: false }; // can't refer yourself
        await createReferral(referrer.id, input.refereeId, input.code);
        return { success: true };
      }),

    /** Request a payout of the user's referral balance — notifies the owner */
    requestPayout: protectedProcedure
      .input(z.object({ paypalEmail: z.string().email().optional(), note: z.string().max(500).optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
        const row = await db.select({ referralBalance: users.referralBalance, name: users.name, email: users.email })
          .from(users).where(eq(users.id, ctx.user.id)).limit(1);
        const balance = row[0]?.referralBalance ?? 0;
        if (balance <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No balance to pay out." });
        const balanceDollars = (balance / 100).toFixed(2);
        await notifyOwner({
          title: `💰 Payout Request — $${balanceDollars}`,
          content: [
            `User: ${row[0]?.name ?? "Unknown"} (ID: ${ctx.user.id})`,
            `Email: ${row[0]?.email ?? "N/A"}`,
            `Payout Email: ${input.paypalEmail ?? "Not provided"}`,
            `Balance: $${balanceDollars}`,
            `Note: ${input.note ?? "None"}`,
          ].join("\n"),
        });
        return { success: true, balanceDollars };
      }),
  }),
});

export type AppRouter = typeof appRouter;

