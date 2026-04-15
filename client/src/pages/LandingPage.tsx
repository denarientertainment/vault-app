/**
 * SecureVault — Marketing Landing Page
 * Public-facing page with pricing and Stripe checkout CTA.
 * Users must log in and pay $4.99 once to access the vault.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Download,
  CreditCard,
  FileText,
  User,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-hero-bg-WyJUQMZqEmAPh6mCNwaMmo.webp";
const SHIELD_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-logo-shield-T3DZebxsVzGmng5dh6pkbC.webp";

const FEATURES = [
  { icon: <Lock size={20} />, title: "AES-256 Encryption", desc: "Military-grade encryption. Your data is encrypted before it ever leaves your device." },
  { icon: <Shield size={20} />, title: "Zero-Knowledge Architecture", desc: "We never see your passwords. Not even a single character. Ever." },
  { icon: <Download size={20} />, title: "Easy Device Transfer", desc: "Export your encrypted vault and restore it on any device in seconds." },
  { icon: <CreditCard size={20} />, title: "Passwords & Cards", desc: "Store login credentials, credit cards, secure notes, and personal identities." },
  { icon: <FileText size={20} />, title: "Secure Notes", desc: "Keep private notes, recovery codes, and sensitive documents locked away." },
  { icon: <User size={20} />, title: "Personal Identities", desc: "Store passport numbers, SSNs, and other sensitive personal information safely." },
];

const TESTIMONIALS = [
  { name: "Alex R.", role: "Software Engineer", text: "Finally a password manager that doesn't require a subscription. One-time payment and it's mine forever." },
  { name: "Maria L.", role: "Small Business Owner", text: "The device transfer feature is incredible. Switched phones and had all my passwords in under 2 minutes." },
  { name: "James K.", role: "Security Researcher", text: "AES-256 with zero-knowledge architecture. This is exactly how a password manager should work." },
];

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Track referral visit: read ?ref= from URL and store in sessionStorage
  const trackReferral = trpc.referral.trackVisit.useMutation();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      // Persist code so it survives the OAuth redirect
      sessionStorage.setItem("sv_ref", refCode);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const storedCode = sessionStorage.getItem("sv_ref");
    if (!storedCode) return;
    // Record the referral once the user is logged in
    trackReferral.mutate(
      { code: storedCode, refereeId: user.id },
      { onSettled: () => sessionStorage.removeItem("sv_ref") }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const { data: paymentStatus } = trpc.payment.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createCheckout = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
      setIsRedirecting(false);
    },
    onError: (err) => {
      toast.error("Failed to start checkout: " + err.message);
      setIsRedirecting(false);
    },
  });

  const handlePurchase = () => {
    if (paymentStatus?.hasPurchased) {
      window.location.href = "/vault";
      return;
    }
    window.location.href = "/checkout";
  };

  const gold = "oklch(0.72 0.12 75)";
  const navy = "oklch(0.13 0.03 240)";
  const navyMid = "oklch(0.17 0.025 240)";
  const navyLight = "oklch(0.21 0.022 240)";
  const textPrimary = "oklch(0.93 0.01 240)";
  const textMuted = "oklch(0.55 0.015 240)";

  const ctaLabel = !isAuthenticated
    ? "Sign In & Get Access"
    : paymentStatus?.hasPurchased
    ? "Open My Vault"
    : isRedirecting
    ? "Opening Checkout..."
    : "Get Lifetime Access — $4.99";

  return (
    <div style={{ background: navy, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: `${navy}e0`, backdropFilter: "blur(12px)", borderBottom: `1px solid oklch(1 0 0 / 6%)` }}>
        <div className="flex items-center gap-2.5">
          <img src={SHIELD_LOGO} alt="SecureVault" className="w-7 h-7" />
          <span className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif", color: gold }}>SecureVault</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm" style={{ color: textMuted }}>Hi, {user?.name?.split(" ")[0]}</span>
              <a href="/account" className="text-sm hover:underline" style={{ color: textMuted }}>My Account</a>
            </>
          ) : null}
          <Button
            onClick={handlePurchase}
            size="sm"
            style={{ background: gold, color: navy, fontWeight: 600 }}
          >
            {paymentStatus?.hasPurchased ? "Open Vault" : "Get Access"}
          </Button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden"
        style={{ minHeight: "100vh", backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0" style={{ background: `${navy}cc` }} />
        <motion.div className="relative z-10 max-w-3xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: `${gold}20`, color: gold, border: `1px solid ${gold}40` }}>
            <Zap size={12} /> One-time payment. No subscriptions. Ever.
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Passwords.<br />
            <span style={{ color: gold }}>Locked Down.</span>
          </h1>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: textMuted }}>
            SecureVault stores all your passwords and secrets with AES-256 encryption. Only you can unlock it. No cloud. No subscriptions. No compromises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handlePurchase}
              size="lg"
              disabled={isRedirecting}
              className="text-base px-8 py-6 font-semibold"
              style={{ background: gold, color: navy }}
            >
              {ctaLabel} <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
          <p className="mt-4 text-xs" style={{ color: textMuted }}>
            Pay once. Use forever. 30-day money-back guarantee.
          </p>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold text-center mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-center mb-14" style={{ color: textMuted }}>Built for people who take their privacy seriously.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="p-6 rounded-xl"
              style={{ background: navyMid, border: `1px solid oklch(1 0 0 / 8%)` }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${gold}18`, color: gold }}>
                {f.icon}
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm" style={{ color: textMuted }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="px-6 py-24" style={{ background: navyMid }}>
        <div className="max-w-md mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Simple, honest pricing.</h2>
            <p className="mb-10" style={{ color: textMuted }}>One price. One time. Unlimited use.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl p-8"
            style={{ background: navy, border: `2px solid ${gold}50` }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6" style={{ background: `${gold}20`, color: gold }}>
              <Star size={11} fill="currentColor" /> Most Popular
            </div>
            <div className="mb-2">
              <span className="text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: gold }}>$4.99</span>
            </div>
            <p className="text-sm mb-8" style={{ color: textMuted }}>One-time payment — lifetime access</p>
            <ul className="space-y-3 text-sm text-left mb-8">
              {[
                "Unlimited passwords, notes & cards",
                "AES-256 military-grade encryption",
                "Zero-knowledge architecture",
                "Encrypted device transfer",
                "No monthly fees. Ever.",
                "30-day money-back guarantee",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle size={15} style={{ color: gold, flexShrink: 0 }} />
                  <span style={{ color: textPrimary }}>{item}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={handlePurchase}
              disabled={isRedirecting}
              className="w-full py-6 text-base font-semibold"
              style={{ background: gold, color: navy }}
            >
              {ctaLabel} <ArrowRight size={16} className="ml-2" />
            </Button>
            <p className="mt-4 text-xs" style={{ color: textMuted }}>
              Secure checkout powered by Stripe. Test card: 4242 4242 4242 4242
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
            Trusted by privacy-conscious users
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 rounded-xl"
              style={{ background: navyMid, border: `1px solid oklch(1 0 0 / 8%)` }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} size={13} style={{ color: gold }} fill={gold} />)}
              </div>
              <p className="text-sm mb-4" style={{ color: textMuted }}>"{t.text}"</p>
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs" style={{ color: textMuted }}>{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 py-24 text-center" style={{ background: navyMid }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to secure your digital life?
          </h2>
          <p className="mb-8" style={{ color: textMuted }}>Join thousands of users who trust SecureVault with their most sensitive data.</p>
          <Button
            onClick={handlePurchase}
            disabled={isRedirecting}
            size="lg"
            className="text-base px-10 py-6 font-semibold"
            style={{ background: gold, color: navy }}
          >
            {ctaLabel} <ArrowRight size={16} className="ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-8 text-center text-xs" style={{ color: textMuted, borderTop: `1px solid oklch(1 0 0 / 6%)` }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={SHIELD_LOGO} alt="" className="w-4 h-4 opacity-60" />
          <span style={{ fontFamily: "'Playfair Display', serif", color: gold }}>SecureVault</span>
        </div>
        <p>© {new Date().getFullYear()} SecureVault. All rights reserved. Your data stays on your device.</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <a href="/terms" className="hover:underline transition-colors" style={{ color: gold }}>Terms of Service</a>
          <span style={{ color: "oklch(0.35 0.01 240)" }}>·</span>
          <a href="/orders" className="hover:underline transition-colors" style={{ color: textMuted }}>My Orders</a>
          <span style={{ color: "oklch(0.35 0.01 240)" }}>·</span>
          <a href="/account" className="hover:underline transition-colors" style={{ color: textMuted }}>My Account</a>
        </div>
      </footer>
    </div>
  );
}
