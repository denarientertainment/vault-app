/**
 * SecureVault — LockScreen
 * Design: Swiss Minimalism meets Secure Banking UI
 * Full-screen hero with dark navy background, gold accents, PIN pad
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVault } from "@/contexts/VaultContext";
import { toast } from "sonner";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-hero-bg-WyJUQMZqEmAPh6mCNwaMmo.webp";
const SHIELD_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-logo-shield-T3DZebxsVzGmng5dh6pkbC.webp";

const PIN_LENGTH = 6;

interface LockScreenProps {
  mode: "setup" | "locked";
}

export default function LockScreen({ mode }: LockScreenProps) {
  const { setupPasscode, unlock } = useVault();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const isSetup = mode === "setup";
  const currentPin = step === "confirm" ? confirmPin : pin;

  const handleDigit = (digit: string) => {
    if (currentPin.length >= PIN_LENGTH) return;
    if (step === "confirm") {
      setConfirmPin((p) => p + digit);
    } else {
      setPin((p) => p + digit);
    }
  };

  const handleDelete = () => {
    if (step === "confirm") {
      setConfirmPin((p) => p.slice(0, -1));
    } else {
      setPin((p) => p.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (step === "confirm") setConfirmPin("");
    else setPin("");
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (currentPin.length < PIN_LENGTH) return;

    if (isSetup) {
      if (step === "enter") {
        // Move to confirm step
        setTimeout(() => setStep("confirm"), 200);
      } else {
        // Confirm step — compare PINs
        if (confirmPin === pin) {
          setupPasscode(pin);
          toast.success("Vault created successfully!");
        } else {
          triggerShake();
          toast.error("PINs do not match. Please try again.");
          setPin("");
          setConfirmPin("");
          setStep("enter");
        }
      }
    } else {
      // Unlock mode
      const success = unlock(pin);
      if (!success) {
        triggerShake();
        setAttempts((a) => a + 1);
        setPin("");
        if (attempts >= 2) {
          toast.error("Incorrect passcode. Vault remains locked.");
        } else {
          toast.error("Incorrect passcode.");
        }
      }
    }
  }, [currentPin]);

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[oklch(0.13_0.03_240/0.85)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-3"
        >
          <img
            src={SHIELD_LOGO}
            alt="SecureVault"
            className="w-16 h-16 gold-shimmer"
          />
          <div className="text-center">
            <h1
              className="text-2xl font-bold tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.72 0.12 75)" }}
            >
              SecureVault
            </h1>
            <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.015 240)" }}>
              {isSetup
                ? step === "enter"
                  ? "Create your master passcode"
                  : "Confirm your passcode"
                : "Enter your passcode to unlock"}
            </p>
          </div>
        </motion.div>

        {/* Gold divider */}
        <div className="w-full gold-divider" />

        {/* PIN dots */}
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-4"
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`pin-dot ${i < currentPin.length ? "filled" : ""}`}
            />
          ))}
        </motion.div>

        {/* PIN Pad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          {digits.map((d, i) => {
            if (d === null) {
              return <div key={i} />;
            }
            if (d === "del") {
              return (
                <button
                  key={i}
                  className="pin-btn text-base"
                  onClick={handleDelete}
                  aria-label="Delete"
                >
                  ⌫
                </button>
              );
            }
            return (
              <button
                key={i}
                className="pin-btn"
                onClick={() => handleDigit(String(d))}
                aria-label={String(d)}
              >
                {d}
              </button>
            );
          })}
        </motion.div>

        {/* Clear button */}
        <button
          className="text-xs transition-colors"
          style={{ color: "oklch(0.55 0.015 240)" }}
          onClick={handleClear}
        >
          Clear
        </button>

        {/* Import vault hint */}
        {isSetup && (
          <p className="text-xs text-center" style={{ color: "oklch(0.45 0.012 240)" }}>
            Already have a vault?{" "}
            <a href="/import" className="underline" style={{ color: "oklch(0.72 0.12 75)" }}>
              Import backup
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
