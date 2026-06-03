import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";

vi.mock("@circle-fin/adapter-viem-v2", () => {
  return {
    createViemAdapterFromPrivateKey: () => ({ mocked: true }),
  };
});

vi.mock("@circle-fin/app-kit", () => {
  class MockAppKit {
    async estimateSend(payload: { amount: string; to: string }) {
      if (payload.to === "0x2222222222222222222222222222222222222222") {
        throw new Error("invalid recipient address");
      }
      if (payload.amount === "999") {
        throw new Error("insufficient balance");
      }
      return { gas: "21000" };
    }

    async send(payload: { amount: string }) {
      if (payload.amount === "999") {
        throw new Error("insufficient balance");
      }
      return {
        name: "transfer",
        state: "success",
        txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        explorerUrl: "https://testnet.arcscan.app/tx/0xaaa",
      };
    }
  }

  return {
    AppKit: MockAppKit,
  };
});

describe("Send API routes", () => {
  const app = createApp();

  beforeEach(() => {
    vi.stubEnv("APP_KIT_PRIVATE_KEY", "0x1111111111111111111111111111111111111111111111111111111111111111");
  });

  it("returns validation error for invalid send payload", async () => {
    const response = await request(app).post("/api/send/execute").send({
      chain: "arc_testnet",
      token: "USDC",
      amount: "0",
      toAddress: "not-address",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns send estimate", async () => {
    const response = await request(app).post("/api/send/estimate").send({
      chain: "arc_testnet",
      token: "USDC",
      amount: "1.5",
      toAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(response.status).toBe(200);
    expect(response.body.chain).toBe("Arc_Testnet");
    expect(response.body.estimatedGas).toBe("21000");
  });

  it("maps invalid recipient errors", async () => {
    const response = await request(app).post("/api/send/estimate").send({
      chain: "arc_testnet",
      token: "USDC",
      amount: "1",
      toAddress: "0x2222222222222222222222222222222222222222",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_RECIPIENT_ADDRESS");
  });

  it("maps insufficient balance errors", async () => {
    const response = await request(app).post("/api/send/execute").send({
      chain: "arc_testnet",
      token: "USDC",
      amount: "999",
      toAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INSUFFICIENT_BALANCE");
  });

  it("returns execution payload", async () => {
    const response = await request(app).post("/api/send/execute").send({
      chain: "arc_testnet",
      token: "USDC",
      amount: "2",
      toAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(response.status).toBe(200);
    expect(response.body.providerState).toBe("success");
    expect(response.body.txHash).toMatch(/^0x/);
  });
});
