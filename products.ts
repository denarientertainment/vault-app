/**
 * SecureVault — Stripe Products
 * One-time purchase to unlock the vault app permanently.
 */

export const PRODUCTS = {
  VAULT_ACCESS: {
    name: "SecureVault — Lifetime Access",
    description: "One-time purchase. Store unlimited passwords, notes, cards, and identities. AES-256 encrypted. Yours forever.",
    /** Price in cents (USD) */
    price: 499,
    currency: "usd",
    mode: "payment" as const,
  },
} as const;
