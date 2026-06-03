import { env } from "../../../shared/config/env";
import type {
  EstimateSendRequest,
  EstimateSendResponse,
  ExecuteSendRequest,
  ExecuteSendResponse,
} from "../../../shared/types/send";

type ApiErrorShape = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class SendApiError extends Error {
  readonly code: string;

  constructor(message: string, code = "SEND_API_ERROR") {
    super(message);
    this.code = code;
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function ensureOk(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  const payload = await parseJson<ApiErrorShape>(response).catch(() => undefined);
  const message = payload?.error?.message ?? "Send API request failed.";
  const code = payload?.error?.code ?? "SEND_API_ERROR";
  throw new SendApiError(message, code);
}

export async function estimateSend(payload: EstimateSendRequest): Promise<EstimateSendResponse> {
  const response = await fetch(`${env.apiBaseUrl}/api/send/estimate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await ensureOk(response);
  return parseJson<EstimateSendResponse>(response);
}

export async function executeSend(payload: ExecuteSendRequest): Promise<ExecuteSendResponse> {
  const response = await fetch(`${env.apiBaseUrl}/api/send/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await ensureOk(response);
  return parseJson<ExecuteSendResponse>(response);
}
