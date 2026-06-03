export type SendToken = "USDC" | "EURC";
export type SendChain = "arc_testnet";

export type EstimateSendRequest = {
  chain: SendChain;
  token: SendToken;
  amount: string;
  toAddress: string;
};

export type EstimateSendResponse = {
  chain: string;
  token: SendToken;
  amount: string;
  fromAddress: string;
  toAddress: string;
  estimatedGas?: string;
};

export type ExecuteSendRequest = EstimateSendRequest;

export type ExecuteSendResponse = {
  chain: string;
  token: SendToken;
  amount: string;
  fromAddress: string;
  toAddress: string;
  txHash?: string;
  explorerUrl?: string;
  providerState: "pending" | "success";
};
