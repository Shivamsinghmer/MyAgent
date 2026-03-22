import { Intent } from '../schemas/intent.schema.js';
import { ExecutionPlan } from '../schemas/plan.schema.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

export function createPlan(intent: Intent): ExecutionPlan {
  logger.info(`Planning for Action: ${intent.action}`);

  const planId = crypto.randomUUID();
  const steps: any[] = [];

  switch (intent.action) {
    case 'get_price':
      steps.push({
        id: crypto.randomUUID(),
        type: 'api_call',
        description: `Fetch ${intent.targetAsset} price via Oracle API`,
        payload: { endpoint: `/api/price/${intent.targetAsset?.toLowerCase() || 'eth'}` },
      });
      break;

    case 'buy_asset':
    case 'swap_asset':
      steps.push({
        id: crypto.randomUUID(),
        type: 'api_call',
        description: `Fetch latest ${intent.targetAsset} price`,
        payload: { endpoint: `/api/price/${intent.targetAsset?.toLowerCase() || 'eth'}` },
      });
      steps.push({
        id: crypto.randomUUID(),
        type: 'blockchain_call',
        description: `Swap for ${intent.amount} ${intent.targetAsset}`,
        payload: {
          asset: intent.targetAsset,
          amount: intent.amount,
          thresholdPrice: intent.thresholdPrice,
          protocol: 'router', // e.g. uniswap V3 universal router mock
        },
      });
      break;

    case 'inspect_balance':
      steps.push({
        id: crypto.randomUUID(),
        type: 'blockchain_call',
        description: `Query blockchain for balance of ${intent.targetAsset || 'ETH'}`,
        payload: { method: 'getBalance', asset: intent.targetAsset || 'ETH' },
      });
      break;

    case 'pay_for_api':
      steps.push({
        id: crypto.randomUUID(),
        type: 'payment_required',
        description: 'Resolve x402 Payment Challenge',
        payload: { amount: intent.amount, destination: intent.destination },
      });
      break;

    default:
      logger.warn(`Unknown intent type: ${intent.action}. Generating an abort plan.`);
      steps.push({
        id: crypto.randomUUID(),
        type: 'abort',
        description: 'Unknown intent mapping, aborting.',
      });
  }

  const executionPlan: ExecutionPlan = {
    intentId: planId,
    steps,
    status: 'pending',
  };

  logger.info(`Created plan with ${steps.length} steps.`);
  return executionPlan;
}
