/**
 * SecureVault — Orders / Purchase History Page
 * Shows the user's Stripe payment records.
 */

import { motion } from "framer-motion";
import { Receipt, ExternalLink, CheckCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

const SHIELD_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-logo-shield-T3DZebxsVzGmng5dh6pkbC.webp";

const gold = "oklch(0.72 0.12 75)";
const navy = "oklch(0.13 0.03 240)";
const navyMid = "oklch(0.17 0.025 240)";
const navyLight = "oklch(0.21 0.022 240)";
const textPrimary = "oklch(0.93 0.01 240)";
const textMuted = "oklch(0.55 0.015 240)";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function OrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data, isLoading } = trpc.payment.orders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: navy }}>
        <div className="text-sm" style={{ color: textMuted }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: navy }}>
        <p style={{ color: textMuted }}>Please sign in to view your orders.</p>
        <Button onClick={() => (window.location.href = getLoginUrl())} style={{ background: gold, color: navy }}>
          Sign In
        </Button>
      </div>
    );
  }

  const orders = data?.orders ?? [];

  return (
    <div className="min-h-screen" style={{ background: navy, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "oklch(1 0 0 / 6%)", background: `${navy}e0`, backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2.5">
          <img src={SHIELD_LOGO} alt="SecureVault" className="w-6 h-6" />
          <span className="font-bold" style={{ fontFamily: "'Playfair Display', serif", color: gold }}>SecureVault</span>
        </div>
        <button
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: textMuted }}
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${gold}18` }}>
            <Receipt size={18} style={{ color: gold }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Purchase History</h1>
            <p className="text-sm" style={{ color: textMuted }}>Your SecureVault payment records</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: navyMid }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl"
            style={{ background: navyMid, border: `1px solid oklch(1 0 0 / 8%)` }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: navyLight }}>
              <ShoppingBag size={24} style={{ color: textMuted }} />
            </div>
            <div className="text-center">
              <p className="font-medium mb-1" style={{ color: textPrimary }}>No purchases yet</p>
              <p className="text-sm" style={{ color: textMuted }}>Your payment history will appear here after checkout.</p>
            </div>
            <Button onClick={() => navigate("/")} style={{ background: gold, color: navy }}>
              Get Lifetime Access — $4.99
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="rounded-xl p-5 flex items-center gap-4"
                style={{ background: navyMid, border: `1px solid oklch(1 0 0 / 8%)` }}
              >
                {/* Status icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "oklch(0.55 0.15 145 / 12%)" }}>
                  <CheckCircle size={18} style={{ color: "oklch(0.70 0.15 145)" }} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate" style={{ color: textPrimary }}>
                    {SHIELD_LOGO && "SecureVault — Lifetime Access"}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: textMuted }}>
                    {formatDate(order.date)}
                  </div>
                  <div className="text-xs mt-1 font-mono" style={{ color: "oklch(0.45 0.012 240)" }}>
                    {order.id.slice(0, 24)}…
                  </div>
                </div>

                {/* Amount + receipt */}
                <div className="text-right shrink-0">
                  <div className="font-semibold" style={{ color: gold }}>
                    {formatCurrency(order.amount, order.currency)}
                  </div>
                  <div className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block" style={{ background: "oklch(0.55 0.15 145 / 12%)", color: "oklch(0.70 0.15 145)" }}>
                    Paid
                  </div>
                  {order.receiptUrl && (
                    <a
                      href={order.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs mt-2 justify-end transition-colors"
                      style={{ color: textMuted }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = gold)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                    >
                      Receipt <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
