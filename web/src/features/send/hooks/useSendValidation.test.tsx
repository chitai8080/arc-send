import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSendValidation } from "./useSendValidation";

describe("useSendValidation", () => {
  it("returns error for invalid address", () => {
    const { result } = renderHook(() =>
      useSendValidation({
        token: "USDC",
        amount: "1",
        toAddress: "bad",
      }),
    );

    expect(result.current).toContain("Recipient");
  });

  it("returns empty string for valid payload", () => {
    const { result } = renderHook(() =>
      useSendValidation({
        token: "USDC",
        amount: "1",
        toAddress: "0x1111111111111111111111111111111111111111",
      }),
    );

    expect(result.current).toBe("");
  });
});
