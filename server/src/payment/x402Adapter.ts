import { logger } from '../utils/logger';
import { executeTransaction, sendEth, getNativeBalance } from '../blockchain/helpers';
import { Address } from 'viem';
import { walletClient } from '../blockchain/clients';

export interface PaymentChallenge {
  address: Address;
  amount: string; // human readable string (e.g. "0.001" for ETH)
  token: string; // symbol, e.g. "ETH"
  endpoint: string;
}

export class X402Adapter {
  constructor() {
    logger.info('X402 Payment Adapter Initialized.');
  }

  /**
   * Handle an HTTP 402 Payment Required scenario.
   * Resolves the payment onchain using viem, enabling the requester to retry.
   */
  async handlePaymentRequirement(challenge: PaymentChallenge): Promise<boolean> {
    logger.warn(`402 Payment Required for ${challenge.endpoint}: [${challenge.amount} ${challenge.token}] to ${challenge.address}`);

    if (challenge.token !== 'ETH') {
      logger.error('Only native ETH x402 payments are supported in MVP.');
      return false;
    }

    try {
      const balance = await getNativeBalance(walletClient.account.address);
      if (parseFloat(balance) < parseFloat(challenge.amount)) {
        logger.error(`Insufficient funds to satisfy 402 challenge. Have ${balance}, need ${challenge.amount}`);
        return false;
      }

      logger.info('Authorizing payment for API requirement...');
      const txHash = await sendEth(challenge.address, challenge.amount);
      logger.info(`Payment satisfied. TxHash: ${txHash}. You can retry the request now.`);

      return true;

    } catch (err: any) {
      logger.error(`Payment failed: ${err.message}`);
      return false;
    }
  }

  /**
   * Mock HTTP request that simulates fetching gated content.
   */
  async mockFetchApi(endpoint: string, thresholdPrice?: string): Promise<any> {
    logger.info(`Fetching data from ${endpoint}...`);

    // Simulate an x402 challenge initially
    if (Math.random() < 0.5 && !process.env.TEST_SKIP_402) {
      const challenge: PaymentChallenge = {
        address: '0x000000000000000000000000000000000000dEaD', // Burn address for demo context
        amount: '0.0001',
        token: 'ETH',
        endpoint,
      };

      const paid = await this.handlePaymentRequirement(challenge);
      if (!paid) {
        throw new Error('402 Payment Required - Resolution Failed');
      }

      logger.info('Retrying fetch since payment succeeded.');
    }

    // Return the successful payload
    return {
      status: 200,
      data: {
        symbol: endpoint.split('/').pop()?.toUpperCase() || 'ETH',
        price: thresholdPrice ? (parseFloat(thresholdPrice) - 50).toString() : '2850.50',
      },
    };
  }
}
