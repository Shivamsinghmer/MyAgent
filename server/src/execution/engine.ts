import { ExecutionPlan, ActionResult } from '../schemas/plan.schema';
import { logger } from '../utils/logger';
import { getNativeBalance } from '../blockchain/helpers';
import { walletClient } from '../blockchain/clients';
import { X402Adapter } from '../payment/x402Adapter';

export class ExecutionEngine {
  private x402: X402Adapter;

  constructor() {
    this.x402 = new X402Adapter();
  }

  async run(plan: ExecutionPlan): Promise<ActionResult> {
    logger.info(`Starting execution. Engine initialized with ${plan.steps.length} steps.`);

    const account = walletClient.account;

    for (const step of plan.steps) {
      logger.info(`Executing step [${step.type}]: ${step.description}`);

      try {
        switch (step.type) {
          case 'api_call':
            // Resolve X402 and Fetch Price
            const response = await this.x402.mockFetchApi(
              step.payload?.endpoint || '/api/default',
              step.payload?.thresholdPrice
            );
            logger.info(`API Response: ${JSON.stringify(response.data)}`);

            if (step.payload?.thresholdPrice && parseFloat(response.data.price) > parseFloat(step.payload.thresholdPrice)) {
              logger.warn(`Price ${response.data.price} is higher than threshold ${step.payload.thresholdPrice}. Aborting next blockchain step.`);
              return { success: false, error: 'Price exceeds threshold' };
            }
            break;

          case 'blockchain_call':
            if (account && step.payload?.method === 'getBalance') {
              const balance = await getNativeBalance(account.address);
              logger.info(`Blockchain Balance [${step.payload.asset}]: ${balance}`);
            } else if (account && step.payload?.protocol === 'router') {
              logger.info(`Simulated swapping ${step.payload.amount} for ${step.payload.asset}.`);
              break;
            } else {
              logger.warn(`Unknown blockchain_call payload: ${JSON.stringify(step.payload) || step.description}`);
            }
            break;

          case 'payment_required':
             logger.info(`Manual payment required detected inside plan: ${step.payload.amount} ${step.payload.destination}`);
             await this.x402.handlePaymentRequirement({
               address: step.payload.destination! as `0x${string}`,
               amount: step.payload.amount!,
               token: 'ETH',
               endpoint: '/api/manual-pay'
             });
            break;

          case 'abort':
            logger.info('Aborting execution due to step type.');
            return { success: false, error: 'Plan mandated abort.' };

          default:
            logger.error(`Unknown step type: ${step.type}`);
        }
      } catch (err: any) {
        logger.error(`Step failed. Engine halting. Error: ${err.message}`);
        return { success: false, error: err.message };
      }
    }

    logger.info(`Execution completed successfully. Engine shutting down for plan ${plan.intentId}.`);
    return { success: true, data: { status: 'Operations successful' } };
  }
}
