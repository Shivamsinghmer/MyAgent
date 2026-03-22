import { describe, it, expect, vi } from 'vitest';
import { X402Adapter } from '../src/payment/x402Adapter';
import * as helpers from '../src/blockchain/helpers';

// Mock the execution layer to not send actual ETH in tests
vi.mock('../src/blockchain/helpers', () => ({
  getNativeBalance: vi.fn().mockResolvedValue('1.5'),
  sendEth: vi.fn().mockResolvedValue('0xMOCKTXHASH1234'),
}));

describe('X402 Adapter', () => {
  it('resolves an x402 payment challenge if balance is sufficient', async () => {
    const adapter = new X402Adapter();

    const success = await adapter.handlePaymentRequirement({
      address: '0x000000000000000000000000000000000000dEaD',
      amount: '0.05',
      token: 'ETH',
      endpoint: '/api/premium'
    });

    expect(success).toBe(true);
    // Explicitly verify the wrapper sent ETH
    expect(helpers.sendEth).toHaveBeenCalledWith('0x000000000000000000000000000000000000dEaD', '0.05');
  });

  it('fails if trying to pay in non-native token for MVP', async () => {
    const adapter = new X402Adapter();
    const success = await adapter.handlePaymentRequirement({
       address: '0x000000000000000000000000000000000000dEaD',
       amount: '100',
       token: 'USDC',
       endpoint: '/api/premium'
    });
    
    expect(success).toBe(false);
  });
});
