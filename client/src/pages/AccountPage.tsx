import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  CreditCard,
  Gift,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function AccountPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: paymentStatus, isLoading: paymentLoading } = trpc.payment.status.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: ordersData, isLoading: ordersLoading } = trpc.payment.orders.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: referralData, isLoading: referralLoading } = trpc.referral.myCode.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: refundData } = trpc.payment.refundEligibility.useQuery(
    undefined,
    { enabled: !!user && !!paymentStatus?.hasPurchased }
  );

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully.");
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] flex items-center justify-center">
        <Skeleton className="w-48 h-8 bg-[#1e2a3a]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] flex flex-col items-center justify-center gap-4 px-4">
        <Lock className="w-16 h-16 text-amber-400" />
        <h1 className="text-2xl font-bold text-white font-['Playfair_Display']">Sign In Required</h1>
        <p className="text-gray-400 text-center">Please sign in to view your account.</p>
        <Button
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
          onClick={() => (window.location.href = getLoginUrl())}
        >
          Sign In
        </Button>
      </div>
    );
  }

  const latestOrder = ordersData?.orders?.[0];
  const balanceDollars = ((referralData?.balanceCents ?? 0) / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-white">
      {/* Header */}
      <header className="border-b border-[#1e2a3a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-logo-shield_fae65497.png"
            alt="SecureVault"
            className="w-8 h-8 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold font-['Playfair_Display'] text-white">My Account</h1>
            <p className="text-xs text-gray-500">SecureVault</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Profile Card */}
        <Card className="bg-[#111827] border-[#1e2a3a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl font-bold text-black font-['Playfair_Display']">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{user.name ?? "Anonymous"}</p>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.email ?? "No email on file"}
                </p>
              </div>
            </div>
            <Separator className="bg-[#1e2a3a]" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Account ID</p>
                <p className="text-gray-300 font-mono">#{user.id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Role</p>
                {user.role === "admin" ? (
                  <Badge className="bg-amber-900/60 text-amber-300 border-amber-700 text-xs">Admin</Badge>
                ) : (
                  <Badge className="bg-[#1e2a3a] text-gray-400 border-[#2a3a4a] text-xs">User</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Status */}
        <Card className="bg-[#111827] border-[#1e2a3a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Purchase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentLoading ? (
              <Skeleton className="h-10 bg-[#1e2a3a] rounded" />
            ) : paymentStatus?.hasPurchased ? (
              <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-800/40 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-green-400 shrink-0" />
                <div>
                  <p className="text-green-300 font-semibold text-sm">SecureVault — Lifetime Access</p>
                  <p className="text-green-500 text-xs">One-time purchase · No subscriptions</p>
                </div>
                <Badge className="ml-auto bg-green-900/60 text-green-300 border-green-700 text-xs">Active</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-[#1e2a3a] border border-[#2a3a4a] rounded-lg">
                <CreditCard className="w-6 h-6 text-gray-500 shrink-0" />
                <div>
                  <p className="text-gray-300 font-semibold text-sm">No active purchase</p>
                  <p className="text-gray-500 text-xs">Get lifetime access for a one-time payment</p>
                </div>
                <Link href="/checkout">
                  <Button size="sm" className="ml-auto bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold">
                    Buy Now
                  </Button>
                </Link>
              </div>
            )}

            {/* Latest Order */}
            {!ordersLoading && latestOrder && (
              <>
                <Separator className="bg-[#1e2a3a]" />
                <div>
                  <p className="text-gray-500 text-xs mb-2">Latest Receipt</p>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-white">{latestOrder.productName}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(latestOrder.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-semibold">
                        ${(latestOrder.amount / 100).toFixed(2)}
                      </span>
                      {latestOrder.receiptUrl && (
                        <a
                          href={latestOrder.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white flex items-center gap-1 text-xs"
                        >
                          Receipt <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Money-Back Guarantee Status */}
        {paymentStatus?.hasPurchased && refundData && (
          <Card className="bg-[#111827] border-[#1e2a3a]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                30-Day Guarantee
              </CardTitle>
            </CardHeader>
            <CardContent>
              {refundData.eligible ? (
                <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-800/40 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-300 font-semibold text-sm">Guarantee Active</p>
                    <p className="text-green-600 text-xs">
                      {refundData.daysRemaining} day{refundData.daysRemaining !== 1 ? "s" : ""} remaining. Contact us for a full refund if not satisfied.
                    </p>
                    <p className="text-gray-600 text-xs mt-1 italic">Note: Receiving a referral reward will void this guarantee.</p>
                  </div>
                </div>
              ) : refundData.reason === "referral_reward_received" ? (
                <div className="flex items-start gap-3 p-3 bg-orange-900/20 border border-orange-800/40 rounded-lg">
                  <Gift className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-orange-300 font-semibold text-sm">Guarantee Voided</p>
                    <p className="text-orange-600 text-xs">
                      You received a referral reward within your first 30 days. Per our terms, the money-back guarantee no longer applies.
                    </p>
                  </div>
                </div>
              ) : refundData.reason === "window_expired" ? (
                <div className="flex items-start gap-3 p-3 bg-[#1e2a3a] border border-[#2a3a4a] rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-400 font-semibold text-sm">Guarantee Expired</p>
                    <p className="text-gray-600 text-xs">The 30-day window has passed.</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Referral Balance */}
        <Card className="bg-[#111827] border-[#1e2a3a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Referral Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referralLoading ? (
              <Skeleton className="h-10 bg-[#1e2a3a] rounded" />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-900/30 rounded-lg">
                    <Gift className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">${balanceDollars} earned</p>
                    <p className="text-gray-500 text-xs">
                      {referralData?.totalInvites ?? 0} invites ·{" "}
                      {referralData?.rewarded ?? 0} rewarded
                    </p>
                  </div>
                </div>
                <Link href="/vault">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-400 border-amber-700 hover:bg-amber-900/20 text-xs"
                  >
                    Refer & Earn
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Link */}
        {user.role === "admin" && (
          <Card className="bg-[#111827] border-amber-800/40">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-amber-300 font-semibold text-sm">Admin Access</p>
                    <p className="text-gray-500 text-xs">View users, revenue, and referral stats</p>
                  </div>
                </div>
                <Link href="/admin">
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold"
                  >
                    Open Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sign Out */}
        <Card className="bg-[#111827] border-[#1e2a3a]">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-white font-semibold text-sm">Sign Out</p>
                  <p className="text-gray-500 text-xs">You'll need to sign back in to access your vault</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 border-red-800/60 hover:bg-red-900/20 hover:text-red-300 text-xs"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
