import { useMemo, useState } from "react";
import type {
  EstimateSendRequest,
  EstimateSendResponse,
  ExecuteSendResponse,
} from "../../../shared/types/send";
import { executeSend, estimateSend, SendApiError } from "../api/sendClient";
import { validateSendInput } from "../utils/validateSendInput";

export type SendUiStatus = "idle" | "loading" | "success" | "fail";

type SendTransferState = {
  status: SendUiStatus;
  errorMessage: string;
  estimate: EstimateSendResponse | null;
  result: ExecuteSendResponse | null;
};

function mapUiError(error: unknown): string {
  if (error instanceof SendApiError) {
    if (error.code === "INVALID_RECIPIENT_ADDRESS") {
      return "Dia chi nguoi nhan khong hop le.";
    }
    if (error.code === "INVALID_AMOUNT") {
      return "So luong gui khong hop le.";
    }
    if (error.code === "INSUFFICIENT_BALANCE") {
      return "So du khong du de thuc hien giao dich.";
    }
    if (error.code === "PROVIDER_ERROR") {
      return "Loi mang hoac provider, vui long thu lai.";
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Khong the gui tai san. Vui long thu lai.";
}

export function useSendTransfer() {
  const [state, setState] = useState<SendTransferState>({
    status: "idle",
    errorMessage: "",
    estimate: null,
    result: null,
  });

  const canSubmit = useMemo(() => state.status !== "loading", [state.status]);

  async function submit(payload: EstimateSendRequest): Promise<boolean> {
    const validationError = validateSendInput({
      token: payload.token,
      amount: payload.amount,
      toAddress: payload.toAddress,
    });

    if (validationError) {
      setState((previous) => ({
        ...previous,
        status: "fail",
        errorMessage: validationError,
      }));
      return false;
    }

    setState((previous) => ({
      ...previous,
      status: "loading",
      errorMessage: "",
      estimate: null,
      result: null,
    }));

    try {
      const estimate = await estimateSend(payload);
      const result = await executeSend(payload);

      setState({
        status: "success",
        errorMessage: "",
        estimate,
        result,
      });

      return true;
    } catch (error) {
      setState((previous) => ({
        ...previous,
        status: "fail",
        errorMessage: mapUiError(error),
      }));
      return false;
    }
  }

  function reset() {
    setState({
      status: "idle",
      errorMessage: "",
      estimate: null,
      result: null,
    });
  }

  return {
    ...state,
    canSubmit,
    submit,
    reset,
  };
}
