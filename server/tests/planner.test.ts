import { describe, it, expect } from 'vitest';
import { createPlan } from '../src/planner/planner';
import { Intent } from '../src/schemas/intent.schema';

describe('Planner Logic', () => {
  it('creates an execution plan for getting balance', () => {
    const intent: Intent = {
      action: 'inspect_balance',
      targetAsset: 'USDC',
      rawPrompt: 'look at my USDC please',
    };

    const plan = createPlan(intent);
    expect(plan.steps.length).toBe(1);
    expect(plan.steps[0].type).toBe('blockchain_call');
    expect(plan.steps[0].payload.method).toBe('getBalance');
  });

  it('creates multi-step plan for buy_asset', () => {
    const intent: Intent = {
      action: 'buy_asset',
      targetAsset: 'UNI',
      amount: '50',
      thresholdPrice: '15',
      rawPrompt: 'buy 50 UNI if price < 15',
    };

    const plan = createPlan(intent);
    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0].type).toBe('api_call'); // Fetch price
    expect(plan.steps[1].type).toBe('blockchain_call'); // Execute swap
    expect(plan.steps[1].payload.thresholdPrice).toBe('15');
  });
});
