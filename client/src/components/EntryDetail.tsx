/**
 * SecureVault — EntryDetail
 * Right panel for viewing a single vault entry
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Copy, Edit, Trash2, Star, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVault } from "@/contexts/VaultContext";
import { VaultEntry } from "@/lib/vault";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EntryDetailProps {
  entry: VaultEntry;
  onEdit: () => void;
  onClose: () => void;
}

function MaskedField({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  const [revealed, setRevealed] = useState(false);
  if (!value) return null;

  const copy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  };

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium tracking-wider uppercase" style={{ color: "oklch(0.45 0.012 240)" }}>
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`flex-1 text-sm break-all ${mono ? "font-mono" : ""}`}
          style={{ color: "oklch(0.93 0.01 240)" }}
        >
          {revealed ? value : "•".repeat(Math.min(value.length, 20))}
        </span>
        <button
          onClick={() => setRevealed(!revealed)}
          className="shrink-0 transition-colors"
          style={{ color: "oklch(0.55 0.015 240)" }}
        >
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button
          onClick={copy}
          className="shrink-0 transition-colors"
          style={{ color: "oklch(0.55 0.015 240)" }}
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

function PlainField({ label, value, mono = false, link = false }: { label: string; value?: string; mono?: boolean; link?: boolean }) {
  if (!value) return null;
  const copy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  };
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium tracking-wider uppercase" style={{ color: "oklch(0.45 0.012 240)" }}>
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span className={`flex-1 text-sm break-all ${mono ? "font-mono" : ""}`} style={{ color: "oklch(0.93 0.01 240)" }}>
          {value}
        </span>
        {link && (
          <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" style={{ color: "oklch(0.72 0.12 75)" }}>
            <ExternalLink size={14} />
          </a>
        )}
        <button onClick={copy} style={{ color: "oklch(0.55 0.015 240)" }}>
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

const typeLabel: Record<string, string> = {
  login: "Login",
  note: "Secure Note",
  card: "Payment Card",
  identity: "Identity",
};

const typeColor: Record<string, string> = {
  login: "oklch(0.50 0.18 260)",
  note: "oklch(0.55 0.15 145)",
  card: "oklch(0.72 0.12 75)",
  identity: "oklch(0.55 0.15 300)",
};

export default function EntryDetail({ entry, onEdit, onClose }: EntryDetailProps) {
  const { deleteEntry, toggleFavorite } = useVault();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    deleteEntry(entry.id);
    toast.success("Entry deleted.");
    onClose();
  };

  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full w-80 shrink-0 border-l overflow-y-auto"
      style={{
        background: "oklch(0.17 0.025 240)",
        borderColor: "oklch(1 0 0 / 8%)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <div className="flex-1 min-w-0">
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: typeColor[entry.type] }}
          >
            {typeLabel[entry.type]}
          </div>
          <h2
            className="text-lg font-bold leading-tight truncate"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.93 0.01 240)" }}
          >
            {entry.title}
          </h2>
        </div>
        <button onClick={onClose} style={{ color: "oklch(0.55 0.015 240)" }} className="ml-2 mt-0.5">
          <X size={16} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <Button
          size="sm"
          onClick={onEdit}
          style={{ background: "oklch(0.72 0.12 75)", color: "oklch(0.13 0.03 240)", fontSize: "12px" }}
        >
          <Edit size={12} className="mr-1" /> Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => toggleFavorite(entry.id)}
          style={{
            background: "transparent",
            borderColor: "oklch(1 0 0 / 10%)",
            color: entry.isFavorite ? "oklch(0.72 0.12 75)" : "oklch(0.55 0.015 240)",
            fontSize: "12px",
          }}
        >
          <Star size={12} className="mr-1" fill={entry.isFavorite ? "currentColor" : "none"} />
          {entry.isFavorite ? "Starred" : "Star"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setConfirmDelete(true)}
          style={{ background: "transparent", borderColor: "oklch(1 0 0 / 10%)", color: "oklch(0.577 0.245 27.325)", fontSize: "12px", marginLeft: "auto" }}
        >
          <Trash2 size={12} />
        </Button>
      </div>

      {/* Fields */}
      <div className="flex-1 px-5 py-4 space-y-5">
        {entry.type === "login" && (
          <>
            <PlainField label="Username" value={entry.username} />
            <MaskedField label="Password" value={entry.password} mono />
            <PlainField label="Website" value={entry.url} link />
          </>
        )}
        {entry.type === "note" && (
          <div className="space-y-1">
            <div className="text-xs font-medium tracking-wider uppercase" style={{ color: "oklch(0.45 0.012 240)" }}>
              Content
            </div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: "oklch(0.93 0.01 240)" }}>
              {entry.content}
            </p>
          </div>
        )}
        {entry.type === "card" && (
          <>
            <MaskedField label="Card Number" value={entry.cardNumber} mono />
            <PlainField label="Cardholder" value={entry.cardHolder} />
            <PlainField label="Expiry" value={entry.expiry} mono />
            <MaskedField label="CVV" value={entry.cvv} mono />
          </>
        )}
        {entry.type === "identity" && (
          <>
            <PlainField label="Full Name" value={entry.fullName} />
            <PlainField label="Email" value={entry.email} />
            <PlainField label="Phone" value={entry.phone} />
            <PlainField label="Address" value={entry.address} />
          </>
        )}
        {entry.notes && (
          <>
            <div className="gold-divider" />
            <div className="space-y-1">
              <div className="text-xs font-medium tracking-wider uppercase" style={{ color: "oklch(0.45 0.012 240)" }}>
                Notes
              </div>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "oklch(0.75 0.01 240)" }}>
                {entry.notes}
              </p>
            </div>
          </>
        )}

        {/* Metadata */}
        <div className="gold-divider" />
        <div className="space-y-1 text-xs" style={{ color: "oklch(0.45 0.012 240)" }}>
          <div>Added: {new Date(entry.createdAt).toLocaleDateString()}</div>
          <div>Updated: {new Date(entry.updatedAt).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent style={{ background: "oklch(0.17 0.025 240)", border: "1px solid oklch(1 0 0 / 10%)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "oklch(0.93 0.01 240)" }}>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: "oklch(0.55 0.015 240)" }}>
              This will permanently remove <strong style={{ color: "oklch(0.93 0.01 240)" }}>{entry.title}</strong> from your vault. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ background: "transparent", borderColor: "oklch(1 0 0 / 10%)", color: "oklch(0.55 0.015 240)" }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              style={{ background: "oklch(0.577 0.245 27.325)", color: "white" }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
