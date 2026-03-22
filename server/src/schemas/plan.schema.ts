import { z } from 'zod';

export const planStepType = z.enum([
  'blockchain_call',
  'api_call',
  'payment_required',
  'retry',
  'abort'
]);

export type PlanStepType = z.infer<typeof planStepType>;

export const planStepSchema = z.object({
  id: z.string(),
  type: planStepType,
  description: z.string(),
  payload: z.any().optional(), // Specific payload based on step type
});

export type PlanStep = z.infer<typeof planStepSchema>;

export const executionPlanSchema = z.object({
  intentId: z.string(),
  steps: z.array(planStepSchema),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'aborted']),
});

export type ExecutionPlan = z.infer<typeof executionPlanSchema>;

export const actionResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  txHash: z.string().optional(),
});

export type ActionResult = z.infer<typeof actionResultSchema>;
