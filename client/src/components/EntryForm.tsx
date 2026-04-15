/**
 * SecureVault — EntryForm
 * Modal dialog for creating and editing vault entries
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, RefreshCw, Copy } from "lucide-react";
import { useVault } from "@/contexts/VaultContext";
import { VaultEntry, EntryType } from "@/lib/vault";
import { generatePassword } from "@/lib/crypto";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import { toast } from "sonner";

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  entry?: VaultEntry | null;
  defaultType?: EntryType;
}

const defaultEntry: Omit<VaultEntry, "id" | "createdAt" | "updatedAt"> = {
  type: "login",
  title: "",
  username: "",
  password: "",
  url: "",
  content: "",
  cardNumber: "",
  cardHolder: "",
  expiry: "",
  cvv: "",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  isFavorite: false,
};

export default function EntryForm({ open, onClose, entry, defaultType }: EntryFormProps) {
  const { addEntry, updateEntry } = useVault();
  const isEdit = !!entry;

  const [form, setForm] = useState({ ...defaultEntry });
  const [showPassword, setShowPassword] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  useEffect(() => {
    if (entry) {
      setForm({ ...defaultEntry, ...entry });
    } else {
      setForm({ ...defaultEntry, type: defaultType || "login" });
    }
    setShowPassword(false);
    setShowCvv(false);
  }, [entry, open, defaultType]);

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (isEdit && entry) {
      updateEntry(entry.id, form);
      toast.success("Entry updated.");
    } else {
      addEntry(form);
      toast.success("Entry added to vault.");
    }
    onClose();
  };

  const handleGeneratePassword = () => {
    const pwd = generatePassword(20);
    set("password", pwd);
    setShowPassword(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard.");
  };

  const inputStyle = {
    background: "oklch(0.17 0.025 240)",
    borderColor: "oklch(1 0 0 / 10%)",
    color: "oklch(0.93 0.01 240)",
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg"
        style={{ background: "oklch(0.17 0.025 240)", border: "1px solid oklch(1 0 0 / 10%)" }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.93 0.01 240)" }}>
            {isEdit ? "Edit Entry" : "Add New Entry"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type selector */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label style={{ color: "oklch(0.55 0.015 240)" }}>Entry Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v as EntryType)}>
                <SelectTrigger style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "oklch(0.17 0.025 240)", border: "1px solid oklch(1 0 0 / 10%)" }}>
                  <SelectItem value="login">Login / Password</SelectItem>
                  <SelectItem value="note">Secure Note</SelectItem>
                  <SelectItem value="card">Payment Card</SelectItem>
                  <SelectItem value="identity">Identity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label style={{ color: "oklch(0.55 0.015 240)" }}>Title *</Label>
            <Input
              placeholder="e.g. Gmail, Bank of America..."
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Type-specific fields */}
          {form.type === "login" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label style={{ color: "oklch(0.55 0.015 240)" }}>Username / Email</Label>
                <Input
                  placeholder="username or email"
                  value={form.username}
                  onChange={(e) => set("username", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "oklch(0.55 0.015 240)" }}>Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="password"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className="pr-10 font-mono"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.55 0.015 240)" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGeneratePassword}
                    title="Generate strong password"
                    style={{ background: "oklch(0.21 0.022 240)", borderColor: "oklch(1 0 0 / 10%)", color: "oklch(0.72 0.12 75)" }}
                  >
                    <RefreshCw size={14} />
                  </Button>
                  {form.password && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(form.password!)}
                      title="Copy password"
                      style={{ background: "oklch(0.21 0.022 240)", borderColor: "oklch(1 0 0 / 10%)", color: "oklch(0.55 0.015 240)" }}
                    >
                      <Copy size={14} />
                    </Button>
                  )}
                </div>
                <PasswordStrengthMeter password={form.password ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "oklch(0.55 0.015 240)" }}>Website URL</Label>
                <Input
                  placeholder="https://..."
                  value={form.url}
                  onChange={(e) => set("url", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {form.type === "note" && (
            <div className="space-y-1.5">
              <Label style={{ color: "oklch(0.55 0.015 240)" }}>Secure Content</Label>
              <Textarea
                placeholder="Enter your secure note..."
                rows={6}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                style={{ ...inputStyle, resize: "none" }}
              />
            </div>
          )}

          {form.type === "card" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label style={{ color: "oklch(0.55 0.015 240)" }}>Card Number</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={form.cardNumber}
                  onChange={(e) => set("cardNumber", e.target.value)}
                  className="font-mono"
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "oklch(0.55 0.015 240)" }}>Cardholder Name</Label>
                <Input
                  placeholder="Full name on card"
                  value={form.cardHolder}
                  onChange={(e) => set("cardHolder", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label style={{ color: "oklch(0.55 0.015 240)" }}>Expiry</Label>
                  <Input
                    placeholder="MM/YY"
                    value={form.expiry}
                    onChange={(e) => set("expiry", e.target.value)}
                    className="font-mono"
                    style={inputStyle}
                  />
                </div>
                <div className="w-28 space-y-1.5">
                  <Label style={{ color: "oklch(0.55 0.015 240)" }}>CVV</Label>
                  <div className="relative">
                    <Input
                      type={showCvv ? "text" : "password"}
                      placeholder="CVV"
                      value={form.cvv}
                      onChange={(e) => set("cvv", e.target.value)}
                      className="pr-8 font-mono"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.55 0.015 240)" }}
                      onClick={() => setShowCvv(!showCvv)}
                    >
                      {showCvv ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {form.type === "identity" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label style={{ color: "oklch(0.55 0.015 240)" }}>Full Name</Label>
                <Input
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "oklch(0.55 0.015 240)" }}>Email</Label>
                <Input
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "oklch(0.55 0.015 240)" }}>Phone</Label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "oklch(0.55 0.015 240)" }}>Address</Label>
                <Textarea
                  placeholder="Street, City, State, ZIP"
                  rows={2}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>
            </div>
          )}

          {/* Notes (common) */}
          <div className="space-y-1.5">
            <Label style={{ color: "oklch(0.55 0.015 240)" }}>Additional Notes</Label>
            <Textarea
              placeholder="Optional notes..."
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ background: "transparent", borderColor: "oklch(1 0 0 / 10%)", color: "oklch(0.55 0.015 240)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            style={{ background: "oklch(0.72 0.12 75)", color: "oklch(0.13 0.03 240)" }}
          >
            {isEdit ? "Save Changes" : "Add to Vault"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
