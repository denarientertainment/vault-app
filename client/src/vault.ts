/**
 * SecureVault — Vault Storage Layer
 * All data is encrypted with AES-256 before being written to localStorage.
 * The master passcode hash is stored separately for authentication.
 */

import { encrypt, decrypt, hashPasscode } from "./crypto";

export type EntryType = "login" | "note" | "card" | "identity";

export interface VaultEntry {
  id: string;
  type: EntryType;
  title: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
  // Login fields
  username?: string;
  password?: string;
  url?: string;
  // Note fields
  content?: string;
  // Card fields
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
  // Identity fields
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  // Common
  notes?: string;
  isFavorite?: boolean;
}

const PASSCODE_HASH_KEY = "sv_passcode_hash";
const VAULT_DATA_KEY = "sv_vault_data";

/** Check if a master passcode has been set */
export function hasPasscode(): boolean {
  return !!localStorage.getItem(PASSCODE_HASH_KEY);
}

/** Set the master passcode (first-time setup) */
export function setPasscode(passcode: string): void {
  localStorage.setItem(PASSCODE_HASH_KEY, hashPasscode(passcode));
}

/** Verify a passcode attempt */
export function verifyPasscode(passcode: string): boolean {
  const stored = localStorage.getItem(PASSCODE_HASH_KEY);
  if (!stored) return false;
  return stored === hashPasscode(passcode);
}

/** Change the master passcode (re-encrypts vault) */
export function changePasscode(oldPasscode: string, newPasscode: string): boolean {
  if (!verifyPasscode(oldPasscode)) return false;
  const entries = loadVault(oldPasscode);
  if (entries === null) return false;
  localStorage.setItem(PASSCODE_HASH_KEY, hashPasscode(newPasscode));
  saveVault(entries, newPasscode);
  return true;
}

/** Load and decrypt the vault */
export function loadVault(passcode: string): VaultEntry[] | null {
  const ciphertext = localStorage.getItem(VAULT_DATA_KEY);
  if (!ciphertext) return [];
  const plaintext = decrypt(ciphertext, passcode);
  if (!plaintext) return null;
  try {
    return JSON.parse(plaintext) as VaultEntry[];
  } catch {
    return null;
  }
}

/** Encrypt and save the vault */
export function saveVault(entries: VaultEntry[], passcode: string): void {
  const plaintext = JSON.stringify(entries);
  const ciphertext = encrypt(plaintext, passcode);
  localStorage.setItem(VAULT_DATA_KEY, ciphertext);
}

/** Export the encrypted vault as a downloadable JSON file */
export function exportVault(): void {
  const ciphertext = localStorage.getItem(VAULT_DATA_KEY);
  const hash = localStorage.getItem(PASSCODE_HASH_KEY);
  if (!ciphertext) return;
  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    passcodeHash: hash,
    vault: ciphertext,
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `securevault-backup-${new Date().toISOString().slice(0, 10)}.svault`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import a vault backup file */
export function importVault(
  fileContent: string,
  passcode: string
): { success: boolean; message: string } {
  try {
    const data = JSON.parse(fileContent);
    if (!data.vault || !data.passcodeHash) {
      return { success: false, message: "Invalid backup file format." };
    }
    // Verify the passcode against the backup's hash
    if (data.passcodeHash !== hashPasscode(passcode)) {
      return { success: false, message: "Incorrect passcode for this backup file." };
    }
    // Restore vault
    localStorage.setItem(VAULT_DATA_KEY, data.vault);
    localStorage.setItem(PASSCODE_HASH_KEY, data.passcodeHash);
    return { success: true, message: "Vault imported successfully." };
  } catch {
    return { success: false, message: "Failed to parse backup file." };
  }
}

/** Generate a unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
