/**
 * SecureVault — PaywallGate
 * Wraps the vault app. Redirects to landing page if user hasn't purchased.
 * Shows a loading state while checking payment status.
 */

import { useEffect } from "react";
import { Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

interface PaywallGateProps {
  children: React.ReactNode;
}

export default function PaywallGate({ children }: PaywallGateProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: paymentStatus, isLoading: paymentLoading } = trpc.payment.status.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (authLoading || paymentLoading) return;
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    if (paymentStatus && !paymentStatus.hasPurchased) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, paymentStatus, paymentLoading, navigate]);

  const isChecking = authLoading || (isAuthenticated && paymentLoading);
  const hasAccess = isAuthenticated && paymentStatus?.hasPurchased;

  if (isChecking) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "oklch(0.13 0.03 240)" }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.72 0.12 75 / 15%)" }}>
          <Shield size={22} style={{ color: "oklch(0.72 0.12 75)" }} />
        </div>
        <div className="text-sm" style={{ color: "oklch(0.55 0.015 240)" }}>Verifying access...</div>
      </div>
    );
  }

  if (!hasAccess) return null;

  return <>{children}</>;
}
