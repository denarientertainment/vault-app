/**
 * SecureVault — Stripe Webhook Handler
 * Handles checkout.session.completed to mark users as having purchased vault access.
 * MUST be registered BEFORE express.json() to preserve the raw body for signature verification.
 */

import express, { type Express } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb, markReferralPurchased } from "./db";
import { users } from "../drizzle/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = Array.isArray(req.headers["stripe-signature"])
        ? req.headers["stripe-signature"][0]
        : req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;

      try {
        if (!sig || !webhookSecret) {
          console.warn("[Webhook] Missing signature or secret");
          res.status(400).json({ error: "Missing signature or secret" });
          return;
        }
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Webhook] Signature verification failed:", message);
        res.status(400).json({ error: `Webhook Error: ${message}` });
        return;
      }

      // Handle test events from Stripe dashboard
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        res.json({ verified: true });
        return;
      }

      console.log(`[Webhook] Event received: ${event.type} (${event.id})`);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

        if (userId) {
          try {
            const db = await getDb();
            if (db) {
              await db
                .update(users)
                .set({
                  hasPurchased: true,
                  stripePaymentIntentId: paymentIntentId,
                })
                .where(eq(users.id, parseInt(userId)));
              console.log(`[Webhook] User ${userId} marked as purchased`);
              // Trigger referral reward if this user was referred by someone
              try {
                await markReferralPurchased(parseInt(userId));
              } catch (refErr) {
                console.error("[Webhook] Referral reward failed:", refErr);
              }
            }
          } catch (err) {
            console.error("[Webhook] Failed to update user purchase status:", err);
          }
        }
      }

      res.json({ received: true });
    }
  );
}
