import { AppKit, type SendParams } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { privateKeyToAccount } from "viem/accounts";
import { AppError } from "../../core/errors.js";
import { SUPPORTED_CHAINS } from "../../domain/chains.js";
import type { ExecuteSendInput, EstimateSendInput } from "./send.schemas.js";

type SendEstimateResult = {
  chain: string;
  token: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
  estimatedGas?: string;
};

type ExecuteSendResult = {
  chain: string;
  token: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
  txHash?: string;
  explorerUrl?: string;
  providerState: "pending" | "success";
};

function validateAmount(amount: string) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new AppError(400, "INVALID_AMOUNT", "Amount must be greater than 0.");
  }
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Send request failed.";
}

function mapSendError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const message = normalizeErrorMessage(error);
  const lower = message.toLowerCase();

  if (lower.includes("insufficient") && lower.includes("balance")) {
    return new AppError(400, "INSUFFICIENT_BALANCE", "Insufficient balance for this transfer.");
  }

  if (
    (lower.includes("invalid") || lower.includes("bad")) &&
    (lower.includes("address") || lower.includes("recipient") || lower.includes("checksum"))
  ) {
    return new AppError(400, "INVALID_RECIPIENT_ADDRESS", "Recipient address is not valid.");
  }

  if (lower.includes("amount") && (lower.includes("invalid") || lower.includes("greater than 0"))) {
    return new AppError(400, "INVALID_AMOUNT", "Amount must be greater than 0.");
  }

  if (
    lower.includes("network") ||
    lower.includes("timeout") ||
    lower.includes("rpc") ||
    lower.includes("provider") ||
    lower.includes("fetch")
  ) {
    return new AppError(502, "PROVIDER_ERROR", "Network or provider error while sending transfer.");
  }

  if (lower.includes("private key") || lower.includes("app_kit_private_key")) {
    return new AppError(
      500,
      "CONFIGURATION_ERROR",
      "Server send signer is not configured. Set APP_KIT_PRIVATE_KEY.",
    );
  }

  return new AppError(502, "SEND_FAILED", message);
}

function toEstimatedGas(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  return undefined;
}

export class SendService {
  private readonly appKit = new AppKit();

  async estimate(input: EstimateSendInput): Promise<SendEstimateResult> {
    validateAmount(input.amount);

    const signerKey = process.env.APP_KIT_PRIVATE_KEY;
    if (!signerKey) {
      throw new AppError(
        500,
        "CONFIGURATION_ERROR",
        "Server send signer is not configured. Set APP_KIT_PRIVATE_KEY.",
      );
    }

    const chain = SUPPORTED_CHAINS[input.chain];
    const fromAddress = privateKeyToAccount(signerKey as `0x${string}`).address;

    const sendParams: SendParams = {
      from: {
        adapter: createViemAdapterFromPrivateKey({
          privateKey: signerKey,
        }),
        chain: chain.chainName,
      },
      to: input.toAddress,
      amount: input.amount,
      token: input.token,
    };

    try {
      const estimate = await this.appKit.estimateSend(sendParams);

      return {
        chain: chain.chainName,
        token: input.token,
        amount: input.amount,
        fromAddress,
        toAddress: input.toAddress,
        estimatedGas: toEstimatedGas((estimate as { gas?: unknown }).gas),
      };
    } catch (error) {
      throw mapSendError(error);
    }
  }

  async execute(input: ExecuteSendInput): Promise<ExecuteSendResult> {
    validateAmount(input.amount);

    const signerKey = process.env.APP_KIT_PRIVATE_KEY;
    if (!signerKey) {
      throw new AppError(
        500,
        "CONFIGURATION_ERROR",
        "Server send signer is not configured. Set APP_KIT_PRIVATE_KEY.",
      );
    }

    const chain = SUPPORTED_CHAINS[input.chain];
    const fromAddress = privateKeyToAccount(signerKey as `0x${string}`).address;

    const sendParams: SendParams = {
      from: {
        adapter: createViemAdapterFromPrivateKey({
          privateKey: signerKey,
        }),
        chain: chain.chainName,
      },
      to: input.toAddress,
      amount: input.amount,
      token: input.token,
    };

    try {
      const step = await this.appKit.send(sendParams);

      if (step.state === "error") {
        throw new Error(step.errorMessage ?? "Send execution failed.");
      }

      return {
        chain: chain.chainName,
        token: input.token,
        amount: input.amount,
        fromAddress,
        toAddress: input.toAddress,
        txHash: step.txHash,
        explorerUrl: step.explorerUrl,
        providerState: step.state === "pending" ? "pending" : "success",
      };
    } catch (error) {
      throw mapSendError(error);
    }
  }
}
