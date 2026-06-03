import type { SendToken } from "../../../shared/types/send";

type ValidateSendInputParams = {
  token: SendToken;
  amount: string;
  toAddress: string;
};

export function validateSendInput(params: ValidateSendInputParams): string {
  if (!params.token) {
    return "Token is required.";
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(params.toAddress.trim())) {
    return "Recipient address is invalid.";
  }

  if (!/^\d+(\.\d{1,6})?$/.test(params.amount.trim())) {
    return "Amount must use up to 6 decimal places.";
  }

  const numericAmount = Number(params.amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Amount must be greater than 0.";
  }

  return "";
}
