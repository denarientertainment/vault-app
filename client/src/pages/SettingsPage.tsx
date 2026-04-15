/**
 * SecureVault — Settings Page
 * Change passcode, configure auto-lock timer, view app info
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, Timer, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useVault, AutoLockOption } from "@/contexts/VaultContext";
import { changePasscode } from "@/lib/vault";
import { toast } from "sonner";

const AUTO_LOCK_OPTIONS: { value: AutoLockOption; label: string }[] = [
  { value: 1, label: "1 minute" },
  { value: 5, label: "5 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 0, label: "Never" },
];

const gold = "oklch(0.72 0.12 75)";
const textPrimary = "oklch(0.93 0.01 240)";
const textMuted = "oklch(0.55 0.015 240)";
const navyLight = "oklch(0.21 0.022 240)";
const border = "oklch(1 0 0 / 8%)";

const cardStyle = {
  background: "oklch(0.17 0.025 240)",
  border: `1px solid ${border}`,
  borderRadius: "0.75rem",
};

const inputStyle = {
  background: navyLight,
  borderColor: "oklch(1 0 0 / 10%)",
  color: textPrimary,
};

export default function SettingsPage() {
  const { entries, autoLockMinutes, setAutoLockMinutes } = useVault();
  const [showChangePasscode, setShowChangePasscode] = useState(false);
  const [oldPasscode, setOldPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");

  const handleChangePasscode = () => {
    if (newPasscode.length < 4) { toast.error("New passcode must be at least 4 digits."); return; }
    if (newPasscode !== confirmPasscode) { toast.error("New passcodes do not match."); return; }
    const success = changePasscode(oldPasscode, newPasscode);
    if (success) {
      toast.success("Passcode changed. Please re-lock and unlock.");
      setShowChangePasscode(false);
      setOldPasscode(""); setNewPasscode(""); setConfirmPasscode("");
    } else {
      toast.error("Current passcode is incorrect.");
    }
  };

  const handleAutoLock = (val: AutoLockOption) => {
    setAutoLockMinutes(val);
    const label = AUTO_LOCK_OPTIONS.find((o) => o.value === val)?.label ?? "";
    toast.success(`Auto-lock set to: ${label}`);
  };

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="px-5 py-3 border-b" style={{ borderColor: border }}>
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "oklch(0.45 0.012 240)" }}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: textPrimary }}>
          Settings
        </h2>
        <p className="text-sm mb-8" style={{ color: textMuted }}>
          Manage your vault security and preferences.
        </p>

        <div className="space-y-6">

          {/* ── Security ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={cardStyle} className="overflow-hidden">
            <SectionHeader label="Security" />
            <button
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
              onClick={() => setShowChangePasscode(true)}
              onMouseEnter={(e) => (e.currentTarget.style.background = navyLight)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: navyLight }}>
                <Lock size={16} style={{ color: gold }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: textPrimary }}>Change Master Passcode</div>
                <div className="text-xs" style={{ color: textMuted }}>Update your vault's master passcode</div>
              </div>
              <ChevronRight size={14} style={{ color: "oklch(0.45 0.012 240)" }} />
            </button>
          </motion.div>

          {/* ── Auto-Lock Timer ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.07 }} style={cardStyle} className="overflow-hidden">
            <SectionHeader label="Auto-Lock" />
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: navyLight }}>
                  <Timer size={16} style={{ color: gold }} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: textPrimary }}>Lock after inactivity</div>
                  <div className="text-xs" style={{ color: textMuted }}>Vault locks automatically when you stop interacting</div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {AUTO_LOCK_OPTIONS.map((opt) => {
                  const isSelected = autoLockMinutes === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAutoLock(opt.value)}
                      className="py-2 px-1 rounded-lg text-xs font-medium transition-all text-center"
                      style={{
                        background: isSelected ? `${gold}20` : navyLight,
                        color: isSelected ? gold : textMuted,
                        border: `1px solid ${isSelected ? `${gold}50` : "transparent"}`,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {autoLockMinutes > 0 && (
                <p className="mt-3 text-xs" style={{ color: textMuted }}>
                  Vault will lock after <span style={{ color: gold }}>{autoLockMinutes} minute{autoLockMinutes !== 1 ? "s" : ""}</span> of inactivity.
                </p>
              )}
              {autoLockMinutes === 0 && (
                <p className="mt-3 text-xs" style={{ color: "oklch(0.80 0.10 27)" }}>
                  Auto-lock is disabled. Your vault will remain open until you manually lock it.
                </p>
              )}
            </div>
          </motion.div>

          {/* ── About ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.14 }} style={cardStyle} className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: navyLight }}>
                <Shield size={18} style={{ color: gold }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>SecureVault</h3>
                <p className="text-sm" style={{ color: textMuted }}>
                  Your data is encrypted with AES-256 and stored entirely on your device. No data is ever sent to any server.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { label: "Encryption", value: "AES-256" },
                    { label: "Storage", value: "Local only" },
                    { label: "Total Items", value: String(entries.length) },
                    { label: "Architecture", value: "Zero-knowledge" },
                  ].map((item) => (
                    <div key={item.label} className="p-2.5 rounded-lg" style={{ background: navyLight }}>
                      <div className="text-xs" style={{ color: "oklch(0.45 0.012 240)" }}>{item.label}</div>
                      <div className="text-sm font-medium font-mono" style={{ color: gold }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Change Passcode Dialog */}
      <Dialog open={showChangePasscode} onOpenChange={setShowChangePasscode}>
        <DialogContent style={{ background: "oklch(0.17 0.025 240)", border: "1px solid oklch(1 0 0 / 10%)" }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Playfair Display', serif", color: textPrimary }}>
              Change Master Passcode
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label style={{ color: textMuted }}>Current Passcode</Label>
              <Input type="password" placeholder="Enter current passcode" value={oldPasscode} onChange={(e) => setOldPasscode(e.target.value)} style={inputStyle} />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: textMuted }}>New Passcode</Label>
              <Input type="password" placeholder="Enter new passcode (min. 4 digits)" value={newPasscode} onChange={(e) => setNewPasscode(e.target.value)} style={inputStyle} />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: textMuted }}>Confirm New Passcode</Label>
              <Input type="password" placeholder="Repeat new passcode" value={confirmPasscode} onChange={(e) => setConfirmPasscode(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePasscode(false)} style={{ background: "transparent", borderColor: "oklch(1 0 0 / 10%)", color: textMuted }}>
              Cancel
            </Button>
            <Button onClick={handleChangePasscode} style={{ background: gold, color: "oklch(0.13 0.03 240)" }}>
              Update Passcode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
