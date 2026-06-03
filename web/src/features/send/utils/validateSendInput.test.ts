import { describe, expect, it } from "vitest";
import { validateSendInput } from "./validateSendInput";

describe("validateSendInput", () => {
  it("rejects invalid recipient", () => {
    const result = validateSendInput({
      token: "USDC",
      amount: "1",
      toAddress: "not-an-address",
    });

    expect(result).toContain("Recipient");
  });

  it("rejects invalid amount", () => {
    const result = validateSendInput({
      token: "USDC",
      amount: "0",
      toAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(result).toContain("greater than 0");
  });

  it("accepts valid payload", () => {
    const result = validateSendInput({
      token: "EURC",
      amount: "1.25",
      toAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(result).toBe("");
  });
});
