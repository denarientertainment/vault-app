/**
 * SecureVault — Secure Checkout Page
 * A dedicated, polished payment page with trust signals before redirecting to Stripe.
 * Route: /checkout
 */

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  CheckCircle,
  ArrowRight,
  Star,
  CreditCard,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useLocation } from "wouter";

const SHIELD_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-logo-shield-T3DZebxsVzGmng5dh6pkbC.webp";

const gold = "oklch(0.72 0.12 75)";
const navy = "oklch(0.13 0.03 240)";
const navyMid = "oklch(0.17 0.025 240)";
const navyLight = "oklch(0.21 0.022 240)";
const textPrimary = "oklch(0.93 0.01 240)";
const textMuted = "oklch(0.55 0.015 240)";
const green = "oklch(0.70 0.15 145)";

const WHAT_YOU_GET = [
  "Unlimited passwords, secure notes & cards",
  "AES-256 military-grade encryption",
  "Zero-knowledge — we never see your data",
  "Encrypted device-to-device transfer",
  "Lifetime access — no subscriptions",
  "Future updates included",
];

const TRUST_BADGES = [
  { icon: <Lock size={16} />, label: "SSL Secured", sub: "256-bit encryption" },
  { icon: <Shield size={16} />, label: "Stripe Payments", sub: "PCI DSS compliant" },
  { icon: <RefreshCw size={16} />, label: "30-Day Guarantee", sub: "Full refund policy" },
];

export default function CheckoutPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: paymentStatus, isLoading: statusLoading } = trpc.payment.status.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: refundData } = trpc.payment.refundEligibility.useQuery(
    undefined,
    { enabled: isAuthenticated && !!paymentStatus?.hasPurchased === false }
  );

  // For pre-purchase users: guarantee is shown unless they already have a reward
  // We default to showing it for unauthenticated/new users
  const guaranteeVoided =
    refundData?.eligible === false && refundData?.reason === "referral_reward_received";

  const createCheckout = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to secure Stripe checkout...");
        window.open(data.url, "_blank");
      }
      setIsRedirecting(false);
    },
    onError: (err) => {
      toast.error("Checkout failed: " + err.message);
      setIsRedirecting(false);
    },
  });

  const handleCheckout = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (paymentStatus?.hasPurchased) {
      navigate("/vault");
      return;
    }
    setIsRedirecting(true);
    createCheckout.mutate({ origin: window.location.origin });
  };

  const isLoading = authLoading || statusLoading;
  const alreadyPurchased = isAuthenticated && paymentStatus?.hasPurchased;

  return (
    <div
      className="min-h-screen"
      style={{ background: navy, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Nav ── */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "oklch(1 0 0 / 6%)", background: `${navy}f0`, backdropFilter: "blur(12px)" }}
      >
        <button className="flex items-center gap-2.5" onClick={() => navigate("/")}>
          <img src={SHIELD_LOGO} alt="SecureVault" className="w-7 h-7" />
          <span className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif", color: gold }}>
            SecureVault
          </span>
        </button>
        <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}>
          <Lock size={12} style={{ color: green }} />
          <span>Secure checkout</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ── Left: Product Summary ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <img src={SHIELD_LOGO} alt="" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  SecureVault
                </h1>
                <p className="text-sm" style={{ color: textMuted }}>Lifetime Access</p>
              </div>
            </div>

            <p className="mb-6" style={{ color: textMuted }}>
              A one-time purchase gives you permanent, unlimited access to SecureVault — the most private way to store your passwords and secrets.
            </p>

            {/* What you get */}
            <div className="rounded-xl p-5 mb-6" style={{ background: navyMid, border: `1px solid oklch(1 0 0 / 8%)` }}>
              <h3 className="font-semibold mb-4 text-sm" style={{ color: textPrimary }}>What's included</h3>
              <ul className="space-y-2.5">
                {WHAT_YOU_GET.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle size={14} style={{ color: green, flexShrink: 0 }} />
                    <span style={{ color: textPrimary }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {TRUST_BADGES.map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center text-center p-3 rounded-xl gap-2"
                  style={{ background: navyMid, border: `1px solid oklch(1 0 0 / 8%)` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${gold}18`, color: gold }}>
                    {badge.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: textPrimary }}>{badge.label}</div>
                    <div className="text-xs" style={{ color: textMuted }}>{badge.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Payment Card ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className="rounded-2xl p-8"
              style={{ background: navyMid, border: `2px solid ${gold}40` }}
            >
              {/* Price */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: `${gold}18`, color: gold }}>
                  <Star size={11} fill="currentColor" /> One-time payment
                </div>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: gold }}>
                    $4.99
                  </span>
                </div>
                <p className="text-sm" style={{ color: textMuted }}>USD — billed once, never again</p>
              </div>

              {/* User info if logged in */}
              {isAuthenticated && user && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl mb-6"
                  style={{ background: navyLight, border: `1px solid oklch(1 0 0 / 8%)` }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${gold}20`, color: gold }}>
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: textPrimary }}>{user.name}</div>
                    <div className="text-xs truncate" style={{ color: textMuted }}>{user.email}</div>
                  </div>
                  <CheckCircle size={14} style={{ color: green }} />
                </div>
              )}

              {/* Already purchased state */}
              {alreadyPurchased ? (
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: "oklch(0.55 0.15 145 / 12%)", border: `1px solid ${green}30` }}
                  >
                    <CheckCircle size={18} style={{ color: green }} />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: green }}>Purchase confirmed</div>
                      <div className="text-xs" style={{ color: textMuted }}>You have lifetime access to SecureVault.</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate("/vault")}
                    className="w-full py-6 text-base font-semibold"
                    style={{ background: gold, color: navy }}
                  >
                    Open My Vault <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* CTA */}
                  <Button
                    onClick={handleCheckout}
                    disabled={isRedirecting || isLoading}
                    className="w-full py-6 text-base font-semibold"
                    style={{ background: gold, color: navy }}
                  >
                    {isLoading
                      ? "Checking..."
                      : isRedirecting
                      ? "Opening Stripe..."
                      : !isAuthenticated
                      ? "Sign In to Purchase"
                      : "Pay $4.99 — Lifetime Access"}
                    {!isLoading && !isRedirecting && <ArrowRight size={16} className="ml-2" />}
                  </Button>

                  {/* Stripe branding */}
                  <div className="flex items-center justify-center gap-2 text-xs" style={{ color: textMuted }}>
                    <CreditCard size={12} />
                    <span>Powered by <strong style={{ color: textPrimary }}>Stripe</strong> — Visa, Mastercard, Amex accepted</span>
                  </div>

                  {/* Guarantee notice — conditionally shown */}
                  {!guaranteeVoided ? (
                    <div
                      className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
                      style={{ background: navyLight, border: `1px solid oklch(1 0 0 / 8%)` }}
                    >
                      <RefreshCw size={13} style={{ color: gold, flexShrink: 0, marginTop: 1 }} />
                      <span style={{ color: textMuted }}>
                        <strong style={{ color: textPrimary }}>30-day money-back guarantee.</strong> Not satisfied? Contact us within 30 days for a full refund, no questions asked.
                        <br />
                        <em style={{ fontSize: "0.65rem", opacity: 0.7 }}>Note: Guarantee is void if a referral reward is received within the first 30 days.</em>
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
                      style={{ background: "oklch(0.30 0.08 30 / 20%)", border: `1px solid oklch(0.55 0.12 30 / 40%)` }}
                    >
                      <AlertTriangle size={13} style={{ color: "oklch(0.72 0.15 50)", flexShrink: 0, marginTop: 1 }} />
                      <span style={{ color: textMuted }}>
                        <strong style={{ color: "oklch(0.82 0.12 50)" }}>30-day guarantee voided.</strong> You received a referral reward within your first 30 days, which voids the money-back guarantee per our terms.
                      </span>
                    </div>
                  )}

                  {/* Security note */}
                  <div className="flex items-start gap-2.5 text-xs" style={{ color: textMuted }}>
                    <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>You'll be redirected to Stripe's secure checkout. We never store your card details.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Test card hint */}
            <p className="text-center text-xs mt-4" style={{ color: "oklch(0.40 0.010 240)" }}>
              Test mode: use card <span className="font-mono">4242 4242 4242 4242</span>, any future date & any CVV
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
