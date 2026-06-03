import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as sendClient from "../api/sendClient";
import { useSendTransfer } from "./useSendTransfer";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useSendTransfer", () => {
  it("handles successful send flow", async () => {
    vi.spyOn(sendClient, "estimateSend").mockResolvedValueOnce({
      chain: "Arc_Testnet",
      token: "USDC",
      amount: "1",
      fromAddress: "0x1111111111111111111111111111111111111111",
      toAddress: "0x2222222222222222222222222222222222222222",
      estimatedGas: "21000",
    });

    vi.spyOn(sendClient, "executeSend").mockResolvedValueOnce({
      chain: "Arc_Testnet",
      token: "USDC",
      amount: "1",
      fromAddress: "0x1111111111111111111111111111111111111111",
      toAddress: "0x2222222222222222222222222222222222222222",
      providerState: "success",
      txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });

    const { result } = renderHook(() => useSendTransfer());

    await act(async () => {
      await result.current.submit({
        chain: "arc_testnet",
        token: "USDC",
        amount: "1",
        toAddress: "0x2222222222222222222222222222222222222222",
      });
    });

    expect(result.current.status).toBe("success");
    expect(result.current.result?.providerState).toBe("success");
  });

  it("maps provider error to fail state", async () => {
    vi.spyOn(sendClient, "estimateSend").mockRejectedValueOnce(
      new sendClient.SendApiError("provider failed", "PROVIDER_ERROR"),
    );

    const { result } = renderHook(() => useSendTransfer());

    await act(async () => {
      await result.current.submit({
        chain: "arc_testnet",
        token: "USDC",
        amount: "1",
        toAddress: "0x2222222222222222222222222222222222222222",
      });
    });

    expect(result.current.status).toBe("fail");
    expect(result.current.errorMessage).toContain("provider");
  });
});
