import { z } from 'zod';

export const actionTypes = z.enum([
  'get_price',
  'buy_asset',
  'swap_asset',
  'pay_for_api',
  'inspect_balance',
  'unknown'
]);

export type ActionType = z.infer<typeof actionTypes>;

export const intentSchema = z.object({
  action: actionTypes,
  targetAsset: z.string().nullish().describe('The symbol or address of the asset'),
  amount: z.string().nullish().describe('Amount in human readable format (e.g., 0.1)'),
  thresholdPrice: z.string().nullish().describe('Threshold price in USD to execute'),
  destination: z.string().nullish().describe('Destination address for transfers'),
  rawPrompt: z.string().describe('The original raw user prompt'),
});

export type Intent = z.infer<typeof intentSchema>;
