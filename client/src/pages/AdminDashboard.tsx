import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  CreditCard,
  Share2,
  Gift,
  DollarSign,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  accent,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  accent?: string;
}) {
  return (
    <Card className="bg-[#111827] border-[#1e2a3a]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${accent ?? "bg-[#1e2a3a]"}`}>
          <Icon className="w-4 h-4 text-amber-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white font-['Playfair_Display']">{value}</div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: statsData, isLoading: statsLoading } = trpc.admin.stats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const { data: usersData, isLoading: usersLoading } = trpc.admin.users.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const { data: referralsData, isLoading: referralsLoading } = trpc.admin.referrals.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] flex items-center justify-center">
        <Skeleton className="w-48 h-8 bg-[#1e2a3a]" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0d0f1a] flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="w-16 h-16 text-red-400" />
        <h1 className="text-2xl font-bold text-white font-['Playfair_Display']">Access Denied</h1>
        <p className="text-gray-400">This page is restricted to administrators only.</p>
        <Link href="/" className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    );
  }

  const stats = statsData;
  const revenue = (usersData?.users.filter((u) => u.hasPurchased).length ?? 0) * 20;

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
            <h1 className="text-lg font-bold font-['Playfair_Display'] text-white">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">SecureVault — Owner View</p>
          </div>
        </div>
        <Link href="/" className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to app
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Overview</h2>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 bg-[#1e2a3a] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard
                title="Total Users"
                value={stats?.totalUsers ?? 0}
                icon={Users}
                description="All registered accounts"
              />
              <StatCard
                title="Paid Users"
                value={stats?.paidUsers ?? 0}
                icon={CreditCard}
                description="Completed purchase"
                accent="bg-green-900/40"
              />
              <StatCard
                title="Est. Revenue"
                value={`$${revenue.toFixed(2)}`}
                icon={DollarSign}
                description="Based on $4.99/user"
                accent="bg-amber-900/40"
              />
              <StatCard
                title="Total Referrals"
                value={stats?.totalReferrals ?? 0}
                icon={Share2}
                description="Referral links used"
              />
              <StatCard
                title="Rewards Paid"
                value={stats?.rewardedReferrals ?? 0}
                icon={Gift}
                description="$1 rewards issued"
                accent="bg-purple-900/40"
              />
            </div>
          )}
        </section>

        <Separator className="bg-[#1e2a3a]" />

        {/* Users Table */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Users ({usersData?.users.length ?? 0})
          </h2>
          <Card className="bg-[#111827] border-[#1e2a3a]">
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 bg-[#1e2a3a] rounded" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#1e2a3a] hover:bg-transparent">
                        <TableHead className="text-gray-400">ID</TableHead>
                        <TableHead className="text-gray-400">Name</TableHead>
                        <TableHead className="text-gray-400">Email</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Role</TableHead>
                        <TableHead className="text-gray-400">Ref. Balance</TableHead>
                        <TableHead className="text-gray-400">Joined</TableHead>
                        <TableHead className="text-gray-400">Last Sign In</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData?.users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                            No users yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        usersData?.users.map((u) => (
                          <TableRow key={u.id} className="border-[#1e2a3a] hover:bg-[#1e2a3a]/40">
                            <TableCell className="text-gray-400 text-xs">{u.id}</TableCell>
                            <TableCell className="text-white font-medium">
                              {u.name ?? <span className="text-gray-500 italic">—</span>}
                            </TableCell>
                            <TableCell className="text-gray-300 text-sm">
                              {u.email ?? <span className="text-gray-500 italic">—</span>}
                            </TableCell>
                            <TableCell>
                              {u.hasPurchased ? (
                                <Badge className="bg-green-900/60 text-green-300 border-green-700 text-xs">Paid</Badge>
                              ) : (
                                <Badge className="bg-gray-800 text-gray-400 border-gray-700 text-xs">Free</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {u.role === "admin" ? (
                                <Badge className="bg-amber-900/60 text-amber-300 border-amber-700 text-xs">Admin</Badge>
                              ) : (
                                <Badge className="bg-[#1e2a3a] text-gray-400 border-[#2a3a4a] text-xs">User</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-amber-400 font-mono text-sm">
                              ${((u.referralBalance ?? 0) / 100).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-gray-400 text-xs">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-gray-400 text-xs">
                              {new Date(u.lastSignedIn).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-[#1e2a3a]" />

        {/* Referrals Table */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Referrals ({referralsData?.referrals.length ?? 0})
          </h2>
          <Card className="bg-[#111827] border-[#1e2a3a]">
            <CardContent className="p-0">
              {referralsLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 bg-[#1e2a3a] rounded" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#1e2a3a] hover:bg-transparent">
                        <TableHead className="text-gray-400">ID</TableHead>
                        <TableHead className="text-gray-400">Referrer ID</TableHead>
                        <TableHead className="text-gray-400">Referee ID</TableHead>
                        <TableHead className="text-gray-400">Code</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Reward Paid</TableHead>
                        <TableHead className="text-gray-400">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referralsData?.referrals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                            No referrals yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        referralsData?.referrals.map((r) => (
                          <TableRow key={r.id} className="border-[#1e2a3a] hover:bg-[#1e2a3a]/40">
                            <TableCell className="text-gray-400 text-xs">{r.id}</TableCell>
                            <TableCell className="text-white text-sm">{r.referrerId}</TableCell>
                            <TableCell className="text-white text-sm">{r.refereeId}</TableCell>
                            <TableCell className="font-mono text-amber-400 text-xs">{r.code}</TableCell>
                            <TableCell>
                              {r.status === "rewarded" ? (
                                <Badge className="bg-green-900/60 text-green-300 border-green-700 text-xs">Rewarded</Badge>
                              ) : r.status === "purchased" ? (
                                <Badge className="bg-blue-900/60 text-blue-300 border-blue-700 text-xs">Purchased</Badge>
                              ) : (
                                <Badge className="bg-gray-800 text-gray-400 border-gray-700 text-xs">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {r.rewardPaid ? (
                                <Badge className="bg-green-900/40 text-green-400 border-green-800 text-xs">Yes</Badge>
                              ) : (
                                <Badge className="bg-gray-800 text-gray-500 border-gray-700 text-xs">No</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-400 text-xs">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
