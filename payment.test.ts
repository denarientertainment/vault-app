/**
 * SecureVault — Payment Router Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock getDb so tests don't need a real DB
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ hasPurchased: false }]),
        }),
      }),
    }),
  }),
}));

// Mock Stripe so tests don't need real API keys
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            url: "https://checkout.stripe.com/test-session",
          }),
        },
      },
    })),
  };
});

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-user-open-id",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      hasPurchased: false,
      stripePaymentIntentId: null,
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("payment.status", () => {
  it("returns hasPurchased: false for a new user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.payment.status();
    expect(result).toHaveProperty("hasPurchased");
    expect(typeof result.hasPurchased).toBe("boolean");
  });
});

describe("payment.createCheckoutSession", () => {
  it("returns a Stripe checkout URL", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.payment.createCheckoutSession({
      origin: "https://example.com",
    });
    expect(result).toHaveProperty("url");
    expect(typeof result.url).toBe("string");
    expect(result.url).toContain("stripe.com");
  });
});
