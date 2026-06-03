import { useState } from "react";
import { SendComposer } from "./features/send/components/SendComposer";
import { useSendTransfer } from "./features/send/hooks/useSendTransfer";
import { useSendValidation } from "./features/send/hooks/useSendValidation";
import type { SendToken } from "./shared/types/send";
import "./App.css";

function App() {
  const [token, setToken] = useState<SendToken>("USDC");
  const [amount, setAmount] = useState("1.00");
  const [toAddress, setToAddress] = useState("");

  const validationError = useSendValidation({ token, amount, toAddress });
  const sendTransfer = useSendTransfer();

  function handleSubmit() {
    void sendTransfer.submit({
      chain: "arc_testnet",
      token,
      amount,
      toAddress,
    });
  }

  function handleReset() {
    setToken("USDC");
    setAmount("1.00");
    setToAddress("");
    sendTransfer.reset();
  }

  return (
    <main className="send-page">
      <section className="hero-card">
        <p className="kicker">Arc App Kit Send</p>
        <h1>Web Send Studio</h1>
        <p className="hero-copy">
          Send USDC or EURC on Arc Testnet with App Kit Send flow: estimate fee first,
          then execute transfer in a single guided flow.
        </p>

        <div className="state-strip" data-state={sendTransfer.status}>
          <span className="state-dot" />
          <strong>State:</strong> {sendTransfer.status}
        </div>
      </section>

      <section className="content-grid">
        <SendComposer
          token={token}
          amount={amount}
          toAddress={toAddress}
          validationError={validationError}
          status={sendTransfer.status}
          onTokenChange={setToken}
          onAmountChange={setAmount}
          onToAddressChange={setToAddress}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />

        <aside className="status-panel">
          <header>
            <p className="panel-label">Execution Log</p>
            <h2>Transfer Result</h2>
          </header>

          {sendTransfer.status === "idle" ? (
            <p className="status-text">Fill out the form to begin a send transfer.</p>
          ) : null}

          {sendTransfer.status === "loading" ? (
            <p className="status-text">Estimating gas and submitting transfer via App Kit...</p>
          ) : null}

          {sendTransfer.status === "fail" ? (
            <div className="message error">
              <h3>Transfer failed</h3>
              <p>{sendTransfer.errorMessage}</p>
            </div>
          ) : null}

          {sendTransfer.status === "success" && sendTransfer.estimate && sendTransfer.result ? (
            <div className="message success">
              <h3>Transfer submitted</h3>
              <p>From: {sendTransfer.result.fromAddress}</p>
              <p>To: {sendTransfer.result.toAddress}</p>
              <p>
                Amount: {sendTransfer.result.amount} {sendTransfer.result.token}
              </p>
              <p>Provider state: {sendTransfer.result.providerState}</p>
              {sendTransfer.estimate.estimatedGas ? (
                <p>Estimated gas: {sendTransfer.estimate.estimatedGas}</p>
              ) : null}
              {sendTransfer.result.txHash ? <p>Tx hash: {sendTransfer.result.txHash}</p> : null}
              {sendTransfer.result.explorerUrl ? (
                <p>
                  Explorer: <a href={sendTransfer.result.explorerUrl}>View transaction</a>
                </p>
              ) : null}
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

export default App;
