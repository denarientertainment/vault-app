/**
 * SecureVault — Payment Success Page
 * Shown after Stripe checkout completes successfully.
 */

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

const SHIELD_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-logo-shield-T3DZebxsVzGmng5dh6pkbC.webp";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  useEffect(() => {
    // Invalidate payment status so the vault gate re-checks
    utils.payment.status.invalidate();
  }, [utils]);

  const gold = "oklch(0.72 0.12 75)";
  const navy = "oklch(0.13 0.03 240)";
  const navyMid = "oklch(0.17 0.025 240)";
  const textPrimary = "oklch(0.93 0.01 240)";
  const textMuted = "oklch(0.55 0.015 240)";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: navy, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={SHIELD_LOGO} alt="SecureVault" className="w-14 h-14" />
        </div>

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "oklch(0.55 0.15 145 / 15%)" }}
        >
          <CheckCircle size={40} style={{ color: "oklch(0.70 0.15 145)" }} />
        </motion.div>

        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: gold }}>
          Welcome to SecureVault!
        </h1>
        <p className="mb-8" style={{ color: textMuted }}>
          Your payment was successful. You now have lifetime access to SecureVault. Your data is yours — encrypted, private, and secure.
        </p>

        {/* What's next */}
        <div className="rounded-xl p-6 mb-8 text-left" style={{ background: navyMid, border: "1px solid oklch(1 0 0 / 8%)" }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield size={16} style={{ color: gold }} />
            Getting started
          </h3>
          <ol className="space-y-3 text-sm" style={{ color: textMuted }}>
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: gold }}>1.</span>
              Set your master passcode — this is the only key to your vault.
            </li>
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: gold }}>2.</span>
              Add your first password, note, or card.
            </li>
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: gold }}>3.</span>
              Export an encrypted backup to keep a safe copy.
            </li>
          </ol>
        </div>

        <Button
          onClick={() => navigate("/vault")}
          className="w-full py-6 text-base font-semibold"
          style={{ background: gold, color: navy }}
        >
          Open My Vault <ArrowRight size={16} className="ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
