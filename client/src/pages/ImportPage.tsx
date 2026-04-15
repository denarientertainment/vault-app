/**
 * SecureVault — ImportPage
 * Standalone import page accessible from the lock screen
 */

import { useState, useRef } from "react";
import { Upload, Shield, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importVault } from "@/lib/vault";
import { toast } from "sonner";
import { useLocation } from "wouter";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-hero-bg-WyJUQMZqEmAPh6mCNwaMmo.webp";
const SHIELD_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-logo-shield-T3DZebxsVzGmng5dh6pkbC.webp";

export default function ImportPage() {
  const [, navigate] = useLocation();
  const [importPasscode, setImportPasscode] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportStatus("idle");
    }
  };

  const handleImport = async () => {
    if (!importFile) { toast.error("Please select a backup file."); return; }
    if (!importPasscode) { toast.error("Please enter the passcode."); return; }
    const text = await importFile.text();
    const result = importVault(text, importPasscode);
    if (result.success) {
      setImportStatus("success");
      setImportMessage(result.message);
      toast.success(result.message + " Redirecting...");
      setTimeout(() => window.location.href = "/", 1500);
    } else {
      setImportStatus("error");
      setImportMessage(result.message);
      toast.error(result.message);
    }
  };

  const inputStyle = {
    background: "oklch(0.21 0.022 240)",
    borderColor: "oklch(1 0 0 / 15%)",
    color: "oklch(0.93 0.01 240)",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-[oklch(0.13_0.03_240/0.88)]" />
      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <img src={SHIELD_LOGO} alt="SecureVault" className="w-12 h-12 gold-shimmer" />
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.72 0.12 75)" }}>
            SecureVault
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-xl p-6 space-y-4" style={{ background: "oklch(0.17 0.025 240)", border: "1px solid oklch(1 0 0 / 10%)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Upload size={16} style={{ color: "oklch(0.72 0.12 75)" }} />
            <h2 className="font-semibold" style={{ color: "oklch(0.93 0.01 240)" }}>Import Vault Backup</h2>
          </div>
          <p className="text-xs" style={{ color: "oklch(0.55 0.015 240)" }}>
            Select your <span className="font-mono" style={{ color: "oklch(0.72 0.12 75)" }}>.svault</span> backup file and enter the passcode used when it was created.
          </p>

          <div className="space-y-1.5">
            <Label style={{ color: "oklch(0.55 0.015 240)" }}>Backup File</Label>
            <div className="flex gap-2">
              <Input readOnly value={importFile?.name || ""} placeholder="No file selected" style={inputStyle} />
              <Button variant="outline" onClick={() => fileRef.current?.click()} style={{ background: "oklch(0.21 0.022 240)", borderColor: "oklch(1 0 0 / 10%)", color: "oklch(0.93 0.01 240)" }}>
                Browse
              </Button>
              <input ref={fileRef} type="file" accept=".svault,.json" className="hidden" onChange={handleFileSelect} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label style={{ color: "oklch(0.55 0.015 240)" }}>Backup Passcode</Label>
            <Input
              type="password"
              placeholder="Enter passcode"
              value={importPasscode}
              onChange={(e) => setImportPasscode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
              style={inputStyle}
            />
          </div>

          {importStatus !== "idle" && (
            <div
              className="flex items-center gap-2 text-xs p-3 rounded-lg"
              style={{
                background: importStatus === "success" ? "oklch(0.55 0.15 145 / 15%)" : "oklch(0.577 0.245 27.325 / 15%)",
                color: importStatus === "success" ? "oklch(0.70 0.15 145)" : "oklch(0.80 0.10 27)",
              }}
            >
              {importStatus === "success" ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
              {importMessage}
            </div>
          )}

          <Button
            onClick={handleImport}
            className="w-full"
            disabled={!importFile || !importPasscode}
            style={{ background: "oklch(0.72 0.12 75)", color: "oklch(0.13 0.03 240)", opacity: (!importFile || !importPasscode) ? 0.5 : 1 }}
          >
            <Upload size={14} className="mr-2" /> Import & Restore
          </Button>
        </div>

        <button
          className="flex items-center gap-1.5 mx-auto mt-5 text-xs transition-colors"
          style={{ color: "oklch(0.55 0.015 240)" }}
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={12} /> Back to lock screen
        </button>
      </div>
    </div>
  );
}
