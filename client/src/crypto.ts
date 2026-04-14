/**
 * SecureVault — Crypto Utilities
 * AES-256 encryption/decryption using CryptoJS
 * All encryption happens client-side; no data ever leaves the device.
 */

import CryptoJS from "crypto-js";

/** Encrypt a plaintext string with a passphrase using AES-256 */
export function encrypt(plaintext: string, passphrase: string): string {
  return CryptoJS.AES.encrypt(plaintext, passphrase).toString();
}

/** Decrypt a ciphertext string with a passphrase */
export function decrypt(ciphertext: string, passphrase: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || null;
  } catch {
    return null;
  }
}

/** Hash a passphrase using SHA-256 for storage comparison */
export function hashPasscode(passcode: string): string {
  return CryptoJS.SHA256(passcode).toString();
}

/** Generate a random password of given length */
export function generatePassword(
  length = 20,
  opts = { upper: true, lower: true, numbers: true, symbols: true }
): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let charset = "";
  if (opts.upper) charset += upper;
  if (opts.lower) charset += lower;
  if (opts.numbers) charset += numbers;
  if (opts.symbols) charset += symbols;
  if (!charset) charset = lower + numbers;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => charset[x % charset.length]).join("");
}
