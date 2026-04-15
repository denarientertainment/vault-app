/**
 * SecureVault — VaultList
 * Main content area showing filtered vault entries
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Key, FileText, CreditCard, User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVault } from "@/contexts/VaultContext";
import { VaultEntry, EntryType } from "@/lib/vault";
import { SidebarView } from "./Sidebar";

const typeIcon: Record<EntryType, React.ReactNode> = {
  login: <Key size={16} />,
  note: <FileText size={16} />,
  card: <CreditCard size={16} />,
  identity: <User size={16} />,
};

const typeColor: Record<EntryType, string> = {
  login: "oklch(0.50 0.18 260)",
  note: "oklch(0.55 0.15 145)",
  card: "oklch(0.72 0.12 75)",
  identity: "oklch(0.55 0.15 300)",
};

const viewTitle: Record<SidebarView, string> = {
  all: "All Items",
  logins: "Logins",
  notes: "Secure Notes",
  cards: "Payment Cards",
  identities: "Identities",
  favorites: "Favorites",
  images: "Image Vault",
  referral: "Refer & Earn",
  settings: "Settings",
  transfer: "Transfer & Backup",
};

interface VaultListProps {
  view: SidebarView;
  selectedId: string | null;
  onSelect: (entry: VaultEntry) => void;
  onAdd: (type?: EntryType) => void;
}

export default function VaultList({ view, selectedId, onSelect, onAdd }: VaultListProps) {
  const { entries } = useVault();
  const [search, setSearch] = useState("");

  const filtered = entries.filter((e) => {
    const matchesView =
      view === "all" ||
      (view === "logins" && e.type === "login") ||
      (view === "notes" && e.type === "note") ||
      (view === "cards" && e.type === "card") ||
      (view === "identities" && e.type === "identity") ||
      (view === "favorites" && e.isFavorite);

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.username?.toLowerCase().includes(q) ||
      e.url?.toLowerCase().includes(q) ||
      e.notes?.toLowerCase().includes(q);

    return matchesView && matchesSearch;
  });

  const defaultAddType: EntryType | undefined =
    view === "logins" ? "login" :
    view === "notes" ? "note" :
    view === "cards" ? "card" :
    view === "identities" ? "identity" :
    undefined;

  function getSubtitle(e: VaultEntry): string {
    if (e.type === "login") return e.username || e.url || "";
    if (e.type === "note") return e.content?.slice(0, 60) || "";
    if (e.type === "card") return e.cardNumber ? `•••• ${e.cardNumber.slice(-4)}` : "";
    if (e.type === "identity") return e.email || e.fullName || "";
    return "";
  }

  return (
    <div className="flex flex-col h-full flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.93 0.01 240)" }}
        >
          {viewTitle[view]}
        </h2>
        <Button
          size="sm"
          onClick={() => onAdd(defaultAddType)}
          style={{ background: "oklch(0.72 0.12 75)", color: "oklch(0.13 0.03 240)" }}
        >
          <Plus size={14} className="mr-1" /> Add Item
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b shrink-0" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.45 0.012 240)" }} />
          <Input
            placeholder="Search vault..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
            style={{
              background: "oklch(0.21 0.022 240)",
              borderColor: "oklch(1 0 0 / 8%)",
              color: "oklch(0.93 0.01 240)",
            }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.21 0.022 240)" }}
            >
              <Key size={24} style={{ color: "oklch(0.45 0.012 240)" }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "oklch(0.75 0.01 240)" }}>
                {search ? "No results found" : "No items yet"}
              </p>
              <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.012 240)" }}>
                {search ? "Try a different search term" : "Click 'Add Item' to get started"}
              </p>
            </div>
            {!search && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAdd(defaultAddType)}
                style={{ borderColor: "oklch(0.72 0.12 75 / 40%)", color: "oklch(0.72 0.12 75)", background: "transparent" }}
              >
                <Plus size={14} className="mr-1" /> Add your first item
              </Button>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((entry, i) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
                className={`vault-row w-full text-left ${selectedId === entry.id ? "ring-1" : ""}`}
                style={
                  selectedId === entry.id
                    ? { background: "oklch(0.21 0.022 240)", borderColor: "oklch(0.72 0.12 75 / 30%)" }
                    : {}
                }
                onClick={() => onSelect(entry)}
              >
                {/* Icon */}
                <div
                  className="category-badge shrink-0"
                  style={{ color: typeColor[entry.type] }}
                >
                  {typeIcon[entry.type]}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: "oklch(0.93 0.01 240)" }}>
                      {entry.title}
                    </span>
                    {entry.isFavorite && (
                      <Star size={11} fill="oklch(0.72 0.12 75)" style={{ color: "oklch(0.72 0.12 75)", flexShrink: 0 }} />
                    )}
                  </div>
                  {getSubtitle(entry) && (
                    <div className="text-xs truncate mt-0.5" style={{ color: "oklch(0.45 0.012 240)" }}>
                      {getSubtitle(entry)}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
