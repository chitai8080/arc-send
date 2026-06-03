import { z } from "zod";

const chainSchema = z.enum(["arc_testnet"]).default("arc_testnet");
const tokenSchema = z.enum(["USDC", "EURC"]);

export const estimateSendSchema = z.object({
  chain: chainSchema,
  token: tokenSchema,
  amount: z.string().trim().min(1),
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const executeSendSchema = z.object({
  chain: chainSchema,
  token: tokenSchema,
  amount: z.string().trim().min(1),
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export type EstimateSendInput = z.infer<typeof estimateSendSchema>;
export type ExecuteSendInput = z.infer<typeof executeSendSchema>;
