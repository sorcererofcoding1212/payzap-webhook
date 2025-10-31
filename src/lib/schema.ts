import { z } from "zod";

export const catchTransactionSchema = z.object({
  transactionId: z.string(),
  user_identifier: z.string(),
  amount: z.number(),
  provider: z.string(),
  status: z.string(),
});

export type CatchTransactionSchema = z.infer<typeof catchTransactionSchema>;