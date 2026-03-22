import { describe, it, expect, vi } from 'vitest';
import { parseIntent } from '../src/agent/brain';
import { Intent } from '../src/schemas/intent.schema';

// Mock the Groq client
vi.mock('groq-sdk', () => {
  return {
    default: class MockGroq {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    action: 'buy_asset',
                    targetAsset: 'ETH',
                    amount: '0.1',
                    thresholdPrice: '3000'
                  }),
                },
              },
            ],
          }),
        },
      };
    },
  };
});

describe('Intent Parsing', () => {
  it('identifies buy_asset intents properly', async () => {
    const input = 'Fetch ETH price and prepare to buy 0.1 if below 3000';
    const result: Intent = await parseIntent(input);

    expect(result.action).toBe('buy_asset');
    expect(result.targetAsset).toBe('ETH');
    expect(result.amount).toBe('0.1');
    expect(result.thresholdPrice).toBe('3000');
    expect(result.rawPrompt).toBe(input);
  });
});
