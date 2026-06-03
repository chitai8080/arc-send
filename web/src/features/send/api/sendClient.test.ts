import { afterEach, describe, expect, it, vi } from "vitest";
import { estimateSend, executeSend } from "./sendClient";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sendClient", () => {
  it("returns estimate payload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          chain: "Arc_Testnet",
          token: "USDC",
          amount: "1",
          fromAddress: "0x1111111111111111111111111111111111111111",
          toAddress: "0x2222222222222222222222222222222222222222",
          estimatedGas: "21000",
        }),
        { status: 200 },
      ),
    );

    const result = await estimateSend({
      chain: "arc_testnet",
      token: "USDC",
      amount: "1",
      toAddress: "0x2222222222222222222222222222222222222222",
    });

    expect(result.estimatedGas).toBe("21000");
  });

  it("throws coded API error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: "INSUFFICIENT_BALANCE",
            message: "Insufficient balance for this transfer.",
          },
        }),
        { status: 400 },
      ),
    );

    await expect(
      executeSend({
        chain: "arc_testnet",
        token: "USDC",
        amount: "5",
        toAddress: "0x2222222222222222222222222222222222222222",
      }),
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_BALANCE",
    });
  });
});
