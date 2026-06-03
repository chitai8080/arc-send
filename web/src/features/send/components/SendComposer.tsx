import type { FormEvent } from "react";
import { SEND_TOKEN_LIST } from "../constants/tokens";
import type { SendToken } from "../../../shared/types/send";
import type { SendUiStatus } from "../hooks/useSendTransfer";

type SendComposerProps = {
  token: SendToken;
  amount: string;
  toAddress: string;
  validationError: string;
  status: SendUiStatus;
  onTokenChange: (value: SendToken) => void;
  onAmountChange: (value: string) => void;
  onToAddressChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export function SendComposer({
  token,
  amount,
  toAddress,
  validationError,
  status,
  onTokenChange,
  onAmountChange,
  onToAddressChange,
  onSubmit,
  onReset,
}: SendComposerProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="send-form" onSubmit={handleSubmit}>
      <header className="send-form-header">
        <p className="panel-label">Send Flow</p>
        <h2>Transfer Assets</h2>
      </header>

      <label className="field">
        <span>Token</span>
        <select value={token} onChange={(event) => onTokenChange(event.target.value as SendToken)}>
          {SEND_TOKEN_LIST.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Recipient Address</span>
        <input
          type="text"
          value={toAddress}
          onChange={(event) => onToAddressChange(event.target.value)}
          placeholder="0x..."
          autoComplete="off"
        />
      </label>

      <label className="field">
        <span>Amount</span>
        <input
          type="text"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="1.00"
          autoComplete="off"
        />
      </label>

      {validationError ? <p className="hint error">{validationError}</p> : <p className="hint">Ready to estimate and send.</p>}

      <div className="send-actions">
        <button type="submit" className="btn btn-primary" disabled={Boolean(validationError) || status === "loading"}>
          {status === "loading" ? "Sending..." : "Estimate + Send"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onReset} disabled={status === "loading"}>
          Reset
        </button>
      </div>
    </form>
  );
}
