import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  PRIVATE_KEY: z.string().startsWith('0x').min(66).optional()
    .describe('Wallet private key for executing onchain actions'),
  RPC_URL: z.string().url().optional()
    .describe('RPC URL for network'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
