/**
 * SecureVault — Vault Context
 * Manages authentication state and in-memory decrypted vault entries.
 * The passcode is kept in memory only during an active session.
 * Supports configurable auto-lock timer based on inactivity.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  VaultEntry,
  hasPasscode,
  verifyPasscode,
  setPasscode,
  loadVault,
  saveVault,
  generateId,
} from "@/lib/vault";

type AppState = "setup" | "locked" | "unlocked";

/** Auto-lock timeout options in minutes. 0 = never */
export type AutoLockOption = 0 | 1 | 5 | 15 | 30;
const AUTO_LOCK_KEY = "sv_auto_lock_minutes";

function loadAutoLockSetting(): AutoLockOption {
  const stored = localStorage.getItem(AUTO_LOCK_KEY);
  const parsed = stored ? parseInt(stored) : 5;
  return ([0, 1, 5, 15, 30].includes(parsed) ? parsed : 5) as AutoLockOption;
}

interface VaultContextType {
  appState: AppState;
  entries: VaultEntry[];
  passcode: string;
  autoLockMinutes: AutoLockOption;
  setAutoLockMinutes: (minutes: AutoLockOption) => void;
  // Auth
  setupPasscode: (passcode: string) => void;
  unlock: (passcode: string) => boolean;
  lock: () => void;
  // CRUD
  addEntry: (entry: Omit<VaultEntry, "id" | "createdAt" | "updatedAt">) => void;
  updateEntry: (id: string, updates: Partial<VaultEntry>) => void;
  deleteEntry: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppState>(() =>
    hasPasscode() ? "locked" : "setup"
  );
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [passcode, setPasscodeState] = useState<string>("");
  const [autoLockMinutes, setAutoLockMinutesState] = useState<AutoLockOption>(
    loadAutoLockSetting
  );

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef(appState);
  appStateRef.current = appState;

  const lock = useCallback(() => {
    setPasscodeState("");
    setEntries([]);
    setAppState("locked");
  }, []);

  // ── Auto-lock on tab hide ──
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && appStateRef.current === "unlocked") {
        lock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [lock]);

  // ── Inactivity auto-lock ──
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (autoLockMinutes === 0 || appStateRef.current !== "unlocked") return;
    inactivityTimer.current = setTimeout(() => {
      if (appStateRef.current === "unlocked") lock();
    }, autoLockMinutes * 60 * 1000);
  }, [autoLockMinutes, lock]);

  useEffect(() => {
    if (appState !== "unlocked") {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    const handler = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetInactivityTimer(); // start timer immediately on unlock
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [appState, resetInactivityTimer]);

  const setAutoLockMinutes = useCallback((minutes: AutoLockOption) => {
    setAutoLockMinutesState(minutes);
    localStorage.setItem(AUTO_LOCK_KEY, String(minutes));
  }, []);

  const setupPasscode = useCallback((pc: string) => {
    setPasscode(pc);
    saveVault([], pc);
    setPasscodeState(pc);
    setEntries([]);
    setAppState("unlocked");
  }, []);

  const unlock = useCallback((pc: string): boolean => {
    if (!verifyPasscode(pc)) return false;
    const loaded = loadVault(pc);
    if (loaded === null) return false;
    setPasscodeState(pc);
    setEntries(loaded);
    setAppState("unlocked");
    return true;
  }, []);

  const addEntry = useCallback(
    (entry: Omit<VaultEntry, "id" | "createdAt" | "updatedAt">) => {
      const newEntry: VaultEntry = {
        ...entry,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setEntries((prev) => {
        const updated = [newEntry, ...prev];
        saveVault(updated, passcode);
        return updated;
      });
    },
    [passcode]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<VaultEntry>) => {
      setEntries((prev) => {
        const updated = prev.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e
        );
        saveVault(updated, passcode);
        return updated;
      });
    },
    [passcode]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        saveVault(updated, passcode);
        return updated;
      });
    },
    [passcode]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const updated = prev.map((e) =>
          e.id === id ? { ...e, isFavorite: !e.isFavorite, updatedAt: Date.now() } : e
        );
        saveVault(updated, passcode);
        return updated;
      });
    },
    [passcode]
  );

  return (
    <VaultContext.Provider
      value={{
        appState,
        entries,
        passcode,
        autoLockMinutes,
        setAutoLockMinutes,
        setupPasscode,
        unlock,
        lock,
        addEntry,
        updateEntry,
        deleteEntry,
        toggleFavorite,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
