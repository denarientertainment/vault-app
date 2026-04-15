/**
 * SecureVault — Transfer & Backup Page
 * Export encrypted vault as .svault file, import from backup
 */

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download, Upload, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVault } from "@/contexts/VaultContext";
import { exportVault, importVault } from "@/lib/vault";
import { toast } from "sonner";

export default function TransferPage() {
  const { entries, passcode } = useVault();
  const [importPasscode, setImportPasscode] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (entries.length === 0) {
      toast.error("Your vault is empty. Add some entries first.");
      return;
    }
    exportVault();
    toast.success("Vault exported! Keep this file safe.");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportStatus("idle");
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a backup file.");
      return;
    }
    if (!importPasscode) {
      toast.error("Please enter the passcode for this backup.");
      return;
    }
    const text = await importFile.text();
    const result = importVault(text, importPasscode);
    if (result.success) {
      setImportStatus("success");
      setImportMessage(result.message);
      toast.success(result.message + " Please reload the page.");
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setImportStatus("error");
      setImportMessage(result.message);
      toast.error(result.message);
    }
  };

  const cardStyle = {
    background: "oklch(0.17 0.025 240)",
    border: "1px solid oklch(1 0 0 / 8%)",
    borderRadius: "0.75rem",
  };

  const inputStyle = {
    background: "oklch(0.21 0.022 240)",
    borderColor: "oklch(1 0 0 / 10%)",
    color: "oklch(0.93 0.01 240)",
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="max-w-2xl">
        <h2
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.93 0.01 240)" }}
        >
          Transfer & Backup
        </h2>
        <p className="text-sm mb-8" style={{ color: "oklch(0.55 0.015 240)" }}>
          Export your encrypted vault to transfer to a new device, or import a backup to restore your data.
        </p>

        <div className="space-y-6">
          {/* Export */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={cardStyle}
            className="p-6"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.72 0.12 75 / 15%)" }}
              >
                <Download size={18} style={{ color: "oklch(0.72 0.12 75)" }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: "oklch(0.93 0.01 240)" }}>
                  Export Vault
                </h3>
                <p className="text-sm mb-4" style={{ color: "oklch(0.55 0.015 240)" }}>
                  Download your vault as an encrypted <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: "oklch(0.21 0.022 240)", color: "oklch(0.72 0.12 75)" }}>.svault</code> file.
                  This file is protected by your master passcode and is safe to store or transfer.
                </p>
                <div className="flex items-center gap-3 text-xs mb-4" style={{ color: "oklch(0.55 0.015 240)" }}>
                  <Shield size={13} style={{ color: "oklch(0.72 0.12 75)" }} />
                  <span>AES-256 encrypted — only your passcode can unlock it</span>
                </div>
                <div className="flex items-center gap-3 text-xs mb-5" style={{ color: "oklch(0.55 0.015 240)" }}>
                  <span className="font-mono" style={{ color: "oklch(0.72 0.12 75)" }}>
                    {entries.length}
                  </span>
                  <span>item{entries.length !== 1 ? "s" : ""} in your vault</span>
                </div>
                <Button
                  onClick={handleExport}
                  style={{ background: "oklch(0.72 0.12 75)", color: "oklch(0.13 0.03 240)" }}
                >
                  <Download size={14} className="mr-2" />
                  Download Encrypted Backup
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Import */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={cardStyle}
            className="p-6"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.50 0.18 260 / 15%)" }}
              >
                <Upload size={18} style={{ color: "oklch(0.50 0.18 260)" }} />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "oklch(0.93 0.01 240)" }}>
                    Import Vault
                  </h3>
                  <p className="text-sm" style={{ color: "oklch(0.55 0.015 240)" }}>
                    Restore your vault from a <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: "oklch(0.21 0.022 240)", color: "oklch(0.72 0.12 75)" }}>.svault</code> backup file.
                    This will replace your current vault.
                  </p>
                </div>

                {/* Warning */}
                <div
                  className="flex items-start gap-2 p-3 rounded-lg text-xs"
                  style={{ background: "oklch(0.577 0.245 27.325 / 10%)", color: "oklch(0.80 0.10 27)" }}
                >
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>Importing will overwrite your current vault. Make sure to export a backup first.</span>
                </div>

                {/* File picker */}
                <div className="space-y-1.5">
                  <Label style={{ color: "oklch(0.55 0.015 240)" }}>Backup File (.svault)</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={importFile?.name || ""}
                      placeholder="No file selected"
                      style={inputStyle}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                      style={{ background: "oklch(0.21 0.022 240)", borderColor: "oklch(1 0 0 / 10%)", color: "oklch(0.93 0.01 240)" }}
                    >
                      Browse
                    </Button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".svault,.json"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>

                {/* Passcode */}
                <div className="space-y-1.5">
                  <Label style={{ color: "oklch(0.55 0.015 240)" }}>Backup Passcode</Label>
                  <Input
                    type="password"
                    placeholder="Enter the passcode for this backup"
                    value={importPasscode}
                    onChange={(e) => setImportPasscode(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Status */}
                {importStatus !== "idle" && (
                  <div
                    className="flex items-center gap-2 text-sm p-3 rounded-lg"
                    style={{
                      background: importStatus === "success"
                        ? "oklch(0.55 0.15 145 / 15%)"
                        : "oklch(0.577 0.245 27.325 / 15%)",
                      color: importStatus === "success"
                        ? "oklch(0.70 0.15 145)"
                        : "oklch(0.80 0.10 27)",
                    }}
                  >
                    {importStatus === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    {importMessage}
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={!importFile || !importPasscode}
                  style={{
                    background: "oklch(0.50 0.18 260)",
                    color: "white",
                    opacity: (!importFile || !importPasscode) ? 0.5 : 1,
                  }}
                >
                  <Upload size={14} className="mr-2" />
                  Import & Restore Vault
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
