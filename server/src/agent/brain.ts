import Groq from 'groq-sdk';
import { env } from '../utils/env';
import { logger } from '../utils/logger';
import { Intent, intentSchema } from '../schemas/intent.schema';

let groqClient: Groq | null = null;
try {
  if (env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: env.GROQ_API_KEY });
  }
} catch (e) {
  logger.warn('Groq client initialization failed, AI parsing might be unavailable.');
}

const SYSTEM_PROMPT = `You are an autonomous onchain agent. Your job is to convert natural language into structured Intents.
You only output valid JSON matching the exact schema requested. Do not include markdown, explanations, or any text wrapper, just the raw JSON fields.

The schema:
{
  "action": "get_price" | "buy_asset" | "swap_asset" | "pay_for_api" | "inspect_balance" | "unknown",
  "targetAsset": "Optional symbol or address like 'ETH'",
  "amount": "Optional string like '1.5'",
  "thresholdPrice": "Optional string like '2500'",
  "destination": "Optional address",
  "rawPrompt": "The user input string"
}

If a user says "Fetch ETH price and prepare to buy 0.1 if below 3000", action might be "buy_asset", targetAsset "ETH", amount "0.1", thresholdPrice "3000".
Always set rawPrompt.
`;

export async function parseIntent(userPrompt: string): Promise<Intent> {
  logger.info(`Extracting intent from prompt: "${userPrompt}"`);

  if (!groqClient) {
    // Basic fallback for mock/local without groq
    logger.warn('Using mock intent parsing because Groq is unconfigured.');
    return {
      action: 'unknown',
      rawPrompt: userPrompt,
    };
  }

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '{}';
    logger.debug(`Raw LLM JSON output: ${responseText}`);
    
    // Parse into the schema mapping
    const rawParsed = JSON.parse(responseText);
    const intent = intentSchema.parse({
      ...rawParsed,
      rawPrompt: userPrompt, // ensure it's forced
    });

    logger.info(`Extracted Intent: [${intent.action}]`);
    return intent;

  } catch (error) {
    logger.error('Failed to parse intent via AI:', error);
    throw new Error('Intent extraction failed.');
  }
}
