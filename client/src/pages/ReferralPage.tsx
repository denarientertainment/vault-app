/**
 * SecureVault — Referral Program Page
 * Shows the user's unique referral link, invite stats, $1 reward balance,
 * payout request button, and share-via-email option.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  Star,
  Mail,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const gold = "oklch(0.72 0.12 75)";
const navy = "oklch(0.13 0.03 240)";
const navyMid = "oklch(0.17 0.025 240)";
const navyLight = "oklch(0.21 0.022 240)";
const textPrimary = "oklch(0.93 0.01 240)";
const textMuted = "oklch(0.55 0.015 240)";
const green = "oklch(0.70 0.15 145)";

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [payoutNote, setPayoutNote] = useState("");

  const { data, isLoading } = trpc.referral.myCode.useQuery();

  const referralUrl = data?.code
    ? `${window.location.origin}/?ref=${data.code}`
    : "";

  const payoutMutation = trpc.referral.requestPayout.useMutation({
    onSuccess: (result) => {
      toast.success(`Payout request for $${result.balanceDollars} submitted! We'll process it within 2–3 business days.`);
      setShowPayoutModal(false);
      setPaypalEmail("");
      setPayoutNote("");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleCopy = async () => {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!referralUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Try SecureVault — Password Manager",
          text: "I use SecureVault to keep all my passwords safe. Get lifetime access for just $4.99!",
          url: referralUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleShareEmail = () => {
    if (!referralUrl) return;
    const subject = encodeURIComponent("You should try SecureVault — Password Manager");
    const body = encodeURIComponent(
      `Hey!\n\nI've been using SecureVault to keep all my passwords and private info safe with AES-256 encryption. It's a one-time payment of $4.99 — no subscriptions ever.\n\nGet it here: ${referralUrl}\n\nYou'll love it!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handlePayoutSubmit = () => {
    payoutMutation.mutate({
      paypalEmail: paypalEmail || undefined,
      note: payoutNote || undefined,
    });
  };

  const balanceDollars = ((data?.balanceCents ?? 0) / 100).toFixed(2);
  const hasBalance = (data?.balanceCents ?? 0) > 0;

  const stats = [
    { icon: <Users size={16} />, label: "Total Invites", value: data?.totalInvites ?? 0, color: gold },
    { icon: <Clock size={16} />, label: "Pending", value: data?.pending ?? 0, color: "oklch(0.769 0.188 70.08)" },
    { icon: <Check size={16} />, label: "Rewarded", value: data?.rewarded ?? 0, color: green },
    { icon: <DollarSign size={16} />, label: "Earned", value: `$${balanceDollars}`, color: gold },
  ];

  return (
    <div className="flex flex-col h-full" style={{ color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${gold}18` }}>
          <Gift size={16} style={{ color: gold }} />
        </div>
        <div>
          <h2 className="font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>Refer & Earn</h2>
          <p className="text-xs" style={{ color: textMuted }}>Earn $1 for every friend who buys SecureVault</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Hero reward banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, oklch(0.17 0.04 75) 0%, oklch(0.15 0.025 240) 100%)`, border: `1px solid ${gold}30` }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ background: gold }} />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-8" style={{ background: gold }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: `${gold}20`, color: gold }}>
              <Star size={11} fill="currentColor" /> Referral Program
            </div>
            <div className="text-4xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: gold }}>
              $1.00
            </div>
            <p className="text-sm" style={{ color: textMuted }}>
              earned for every friend who purchases SecureVault
            </p>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl p-4 text-center"
              style={{ background: navyMid, border: `1px solid oklch(1 0 0 / 8%)` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${stat.color}18`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="text-xl font-bold" style={{ color: stat.color }}>
                {isLoading ? "—" : stat.value}
              </div>
              <div className="text-xs mt-0.5" style={{ color: textMuted }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Referral link card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-5 space-y-4"
          style={{ background: navyMid, border: `1px solid oklch(1 0 0 / 8%)` }}
        >
          <div>
            <h3 className="font-semibold mb-1">Your Referral Link</h3>
            <p className="text-xs" style={{ color: textMuted }}>
              Share this link. When someone buys SecureVault through it, you earn $1.
            </p>
          </div>

          {/* Link display */}
          <div className="flex gap-2">
            <div
              className="flex-1 rounded-lg px-3 py-2.5 text-sm font-mono truncate"
              style={{ background: navyLight, color: textMuted, border: `1px solid oklch(1 0 0 / 8%)` }}
            >
              {isLoading ? "Generating your link..." : referralUrl}
            </div>
            <Button
              onClick={handleCopy}
              disabled={isLoading || !referralUrl}
              size="sm"
              variant="outline"
              style={{ background: navyLight, borderColor: "oklch(1 0 0 / 10%)", color: copied ? green : textPrimary, minWidth: 80 }}
            >
              {copied ? <><Check size={13} className="mr-1" /> Copied</> : <><Copy size={13} className="mr-1" /> Copy</>}
            </Button>
          </div>

          {/* Share buttons row */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              disabled={isLoading || !referralUrl}
              style={{ background: gold, color: navy }}
            >
              <Share2 size={14} className="mr-2" />
              Share Link
            </Button>
            <Button
              onClick={handleShareEmail}
              disabled={isLoading || !referralUrl}
              variant="outline"
              style={{ background: navyLight, borderColor: `${gold}40`, color: gold }}
            >
              <Mail size={14} className="mr-2" />
              Email
            </Button>
            <Button
              onClick={() => {
                if (!referralUrl) return;
                const text = encodeURIComponent(`I use SecureVault to keep all my passwords safe with AES-256 encryption. Get lifetime access for just $4.99! ${referralUrl}`);
                window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
              }}
              disabled={isLoading || !referralUrl}
              variant="outline"
              style={{ background: navyLight, borderColor: "oklch(0.55 0.18 240 / 50%)", color: "oklch(0.75 0.12 240)" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X (Twitter)
            </Button>
            <Button
              onClick={() => {
                if (!referralUrl) return;
                const text = encodeURIComponent(`I use SecureVault to keep all my passwords safe with AES-256 encryption. Get lifetime access for just $4.99! ${referralUrl}`);
                window.open(`https://wa.me/?text=${text}`, "_blank");
              }}
              disabled={isLoading || !referralUrl}
              variant="outline"
              style={{ background: navyLight, borderColor: "oklch(0.65 0.18 145 / 50%)", color: "oklch(0.72 0.18 145)" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </Button>
          </div>
        </motion.div>

        {/* Balance & payout card — always shown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl p-5"
          style={{
            background: hasBalance ? "oklch(0.55 0.15 145 / 10%)" : navyMid,
            border: `1px solid ${hasBalance ? green + "30" : "oklch(1 0 0 / 8%)"}`,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${hasBalance ? green : gold}15` }}>
                <DollarSign size={18} style={{ color: hasBalance ? green : gold }} />
              </div>
              <div>
                <div className="font-semibold" style={{ color: hasBalance ? green : textPrimary }}>
                  {isLoading ? "—" : `$${balanceDollars}`} available
                </div>
                <div className="text-xs mt-0.5" style={{ color: textMuted }}>
                  {hasBalance ? "Ready to request payout" : "Invite friends to start earning"}
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowPayoutModal(true)}
              disabled={!hasBalance || isLoading}
              size="sm"
              style={{
                background: hasBalance ? green : "oklch(0.25 0.02 240)",
                color: hasBalance ? "oklch(0.13 0.03 240)" : textMuted,
                cursor: hasBalance ? "pointer" : "not-allowed",
              }}
            >
              <Send size={13} className="mr-1.5" />
              Request Payout
            </Button>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl p-5"
          style={{ background: navyMid, border: `1px solid oklch(1 0 0 / 8%)` }}
        >
          <h3 className="font-semibold mb-4">How it works</h3>
          <div className="space-y-4">
            {[
              { step: "1", title: "Share your link", desc: "Copy your unique referral link or share it directly via email, social media, or messaging apps." },
              { step: "2", title: "They sign up & buy", desc: "When they click your link and complete the $4.99 purchase, the referral is tracked automatically." },
              { step: "3", title: "You earn $1", desc: "Your $1 reward is added to your balance instantly after their payment is confirmed." },
              { step: "4", title: "Request your payout", desc: "Once you have a balance, click 'Request Payout' and we'll send it to your PayPal within 2–3 business days." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: `${gold}20`, color: gold }}>
                  {item.step}
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: textPrimary }}>{item.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: textMuted }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Payout Request Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "oklch(0 0 0 / 70%)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowPayoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 16 }}
              className="w-full max-w-md rounded-2xl p-6 space-y-5"
              style={{ background: "oklch(0.17 0.025 240)", border: "1px solid oklch(1 0 0 / 10%)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Request Payout</h3>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                    We'll send <span style={{ color: green }}>${balanceDollars}</span> to your PayPal within 2–3 business days.
                  </p>
                </div>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: navyLight }}
                >
                  <X size={14} style={{ color: textMuted }} />
                </button>
              </div>

              {/* PayPal email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: textPrimary }}>
                  PayPal Email <span style={{ color: textMuted }}>(optional)</span>
                </label>
                <Input
                  type="email"
                  placeholder="your@paypal.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  style={{ background: navyLight, borderColor: "oklch(1 0 0 / 10%)", color: textPrimary }}
                />
                <p className="text-xs" style={{ color: textMuted }}>
                  If left blank, we'll use your account email on file.
                </p>
              </div>

              {/* Optional note */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: textPrimary }}>
                  Note <span style={{ color: textMuted }}>(optional)</span>
                </label>
                <Input
                  placeholder="Any special instructions..."
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  maxLength={500}
                  style={{ background: navyLight, borderColor: "oklch(1 0 0 / 10%)", color: textPrimary }}
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handlePayoutSubmit}
                disabled={payoutMutation.isPending}
                className="w-full"
                style={{ background: green, color: "oklch(0.13 0.03 240)" }}
              >
                <Send size={14} className="mr-2" />
                {payoutMutation.isPending ? "Submitting..." : `Request $${balanceDollars} Payout`}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
