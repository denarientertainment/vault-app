/**
 * SecureVault — Sidebar Navigation
 * Design: Swiss Minimalism meets Secure Banking UI
 * Persistent left sidebar with category navigation and lock button
 */

import { Shield, Key, FileText, CreditCard, Star, Settings, LogOut, Download, User, Image, Gift } from "lucide-react";
import { useVault } from "@/contexts/VaultContext";
import { cn } from "@/lib/utils";

const SHIELD_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-logo-shield-T3DZebxsVzGmng5dh6pkbC.webp";

export type SidebarView = "all" | "logins" | "notes" | "cards" | "identities" | "favorites" | "images" | "referral" | "settings" | "transfer";

interface SidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

const navItems: { id: SidebarView; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "all", label: "All Items", icon: <Shield size={16} /> },
  { id: "logins", label: "Logins", icon: <Key size={16} /> },
  { id: "notes", label: "Secure Notes", icon: <FileText size={16} /> },
  { id: "cards", label: "Payment Cards", icon: <CreditCard size={16} /> },
  { id: "identities", label: "Identities", icon: <User size={16} /> },
  { id: "favorites", label: "Favorites", icon: <Star size={16} /> },
];

const bottomItems: { id: SidebarView; label: string; icon: React.ReactNode }[] = [
  { id: "images", label: "Image Vault", icon: <Image size={16} /> },
  { id: "referral", label: "Refer & Earn", icon: <Gift size={16} /> },
  { id: "transfer", label: "Transfer / Backup", icon: <Download size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { lock, entries } = useVault();

  const countByType = {
    all: entries.length,
    logins: entries.filter((e) => e.type === "login").length,
    notes: entries.filter((e) => e.type === "note").length,
    cards: entries.filter((e) => e.type === "card").length,
    identities: entries.filter((e) => e.type === "identity").length,
    favorites: entries.filter((e) => e.isFavorite).length,
  };

  return (
    <aside
      className="flex flex-col h-full w-60 shrink-0 border-r"
      style={{
        background: "oklch(0.15 0.028 240)",
        borderColor: "oklch(1 0 0 / 8%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <img src={SHIELD_LOGO} alt="SecureVault" className="w-8 h-8" />
        <div>
          <div
            className="text-base font-bold leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.72 0.12 75)" }}
          >
            SecureVault
          </div>
          <div className="text-xs" style={{ color: "oklch(0.45 0.012 240)" }}>
            {entries.length} item{entries.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <div className="mb-3 px-3 text-xs font-semibold tracking-widest uppercase" style={{ color: "oklch(0.45 0.012 240)" }}>
          Vault
        </div>
        {navItems.map((item) => {
          const count = countByType[item.id as keyof typeof countByType];
          return (
            <button
              key={item.id}
              className={cn("nav-item w-full text-left", activeView === item.id && "active")}
              onClick={() => onViewChange(item.id)}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.21 0.022 240)",
                    color: "oklch(0.55 0.015 240)",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div className="mt-6 mb-3 px-3 text-xs font-semibold tracking-widest uppercase" style={{ color: "oklch(0.45 0.012 240)" }}>
          Manage
        </div>
        {bottomItems.map((item) => (
          <button
            key={item.id}
            className={cn("nav-item w-full text-left", activeView === item.id && "active")}
            onClick={() => onViewChange(item.id)}
          >
            <span className="shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Lock button */}
      <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <button
          className="nav-item w-full text-left"
          onClick={lock}
          style={{ color: "oklch(0.577 0.245 27.325)" }}
        >
          <LogOut size={16} />
          <span>Lock Vault</span>
        </button>
      </div>
    </aside>
  );
}
