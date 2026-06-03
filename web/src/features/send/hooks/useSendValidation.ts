import { useMemo } from "react";
import type { SendToken } from "../../../shared/types/send";
import { validateSendInput } from "../utils/validateSendInput";

type Params = {
  token: SendToken;
  amount: string;
  toAddress: string;
};

export function useSendValidation(params: Params): string {
  return useMemo(
    () =>
      validateSendInput({
        token: params.token,
        amount: params.amount,
        toAddress: params.toAddress,
      }),
    [params.amount, params.toAddress, params.token],
  );
}
