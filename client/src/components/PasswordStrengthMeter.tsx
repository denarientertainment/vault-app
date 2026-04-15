/**
 * SecureVault — Password Strength Meter
 * Evaluates password strength and shows a visual bar + label.
 */

import { useMemo } from "react";

interface PasswordStrengthMeterProps {
  password: string;
}

type StrengthLevel = "empty" | "weak" | "fair" | "strong" | "very-strong";

interface StrengthResult {
  level: StrengthLevel;
  score: number; // 0–4
  label: string;
  color: string;
  suggestions: string[];
}

function evaluateStrength(password: string): StrengthResult {
  if (!password) {
    return { level: "empty", score: 0, label: "", color: "transparent", suggestions: [] };
  }

  let score = 0;
  const suggestions: string[] = [];

  // Length checks
  if (password.length >= 8) score++;
  else suggestions.push("Use at least 8 characters");

  if (password.length >= 12) score++;
  else if (password.length >= 8) suggestions.push("12+ characters is even stronger");

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  if (varietyCount >= 3) score++;
  else suggestions.push("Mix uppercase, numbers & symbols");

  if (varietyCount === 4) score++;

  // Common patterns penalty
  const commonPatterns = [/^[0-9]+$/, /^[a-z]+$/, /^[A-Z]+$/, /password/i, /123456/, /qwerty/i];
  if (commonPatterns.some((p) => p.test(password))) {
    score = Math.max(0, score - 1);
    suggestions.push("Avoid common words or patterns");
  }

  const levels: Record<number, { level: StrengthLevel; label: string; color: string }> = {
    0: { level: "weak", label: "Weak", color: "oklch(0.577 0.245 27.325)" },
    1: { level: "weak", label: "Weak", color: "oklch(0.577 0.245 27.325)" },
    2: { level: "fair", label: "Fair", color: "oklch(0.769 0.188 70.08)" },
    3: { level: "strong", label: "Strong", color: "oklch(0.723 0.219 149.579)" },
    4: { level: "very-strong", label: "Very Strong", color: "oklch(0.72 0.12 75)" },
  };

  const { level, label, color } = levels[Math.min(score, 4)];
  return { level, score: Math.min(score, 4), label, color, suggestions };
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const result = useMemo(() => evaluateStrength(password), [password]);

  if (result.level === "empty") return null;

  const segments = 4;

  return (
    <div className="mt-2 space-y-1.5">
      {/* Bar */}
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i < result.score ? result.color : "oklch(1 0 0 / 8%)",
            }}
          />
        ))}
      </div>

      {/* Label + suggestion */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium"
          style={{ color: result.color }}
        >
          {result.label}
        </span>
        {result.suggestions[0] && (
          <span className="text-xs" style={{ color: "oklch(0.45 0.012 240)" }}>
            {result.suggestions[0]}
          </span>
        )}
      </div>
    </div>
  );
}
