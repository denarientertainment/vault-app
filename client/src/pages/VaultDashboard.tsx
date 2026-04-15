/**
 * SecureVault — VaultDashboard
 * Main authenticated view: Sidebar + VaultList + EntryDetail
 */

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Sidebar, { SidebarView } from "@/components/Sidebar";
import VaultList from "@/components/VaultList";
import EntryDetail from "@/components/EntryDetail";
import EntryForm from "@/components/EntryForm";
import TransferPage from "./TransferPage";
import SettingsPage from "./SettingsPage";
import ImageVaultPage from "./ImageVaultPage";
import ReferralPage from "./ReferralPage";
import { VaultEntry, EntryType } from "@/lib/vault";

export default function VaultDashboard() {
  const [activeView, setActiveView] = useState<SidebarView>("all");
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<VaultEntry | null>(null);
  const [defaultType, setDefaultType] = useState<EntryType | undefined>(undefined);

  const handleAdd = (type?: EntryType) => {
    setEditEntry(null);
    setDefaultType(type);
    setFormOpen(true);
  };

  const handleEdit = () => {
    setEditEntry(selectedEntry);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditEntry(null);
  };

  const handleViewChange = (view: SidebarView) => {
    setActiveView(view);
    setSelectedEntry(null);
  };

  const isContentView = activeView !== "settings" && activeView !== "transfer" && activeView !== "images" && activeView !== "referral";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "oklch(0.13 0.03 240)" }}
    >
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />

      {/* Main content */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {isContentView ? (
          <>
            <VaultList
              view={activeView}
              selectedId={selectedEntry?.id ?? null}
              onSelect={setSelectedEntry}
              onAdd={handleAdd}
            />
            <AnimatePresence>
              {selectedEntry && (
                <EntryDetail
                  key={selectedEntry.id}
                  entry={selectedEntry}
                  onEdit={handleEdit}
                  onClose={() => setSelectedEntry(null)}
                />
              )}
            </AnimatePresence>
          </>
        ) : activeView === "transfer" ? (
          <TransferPage />
        ) : activeView === "images" ? (
          <div className="flex-1 overflow-hidden"><ImageVaultPage /></div>
        ) : activeView === "referral" ? (
          <div className="flex-1 overflow-hidden"><ReferralPage /></div>
        ) : (
          <SettingsPage />
        )}
      </div>

      {/* Entry form modal */}
      <EntryForm
        open={formOpen}
        onClose={handleFormClose}
        entry={editEntry}
        defaultType={defaultType}
      />
    </div>
  );
}
