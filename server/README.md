# Autonomous Onchain Agent MVP

A TypeScript-first, viem-powered onchain agent designed for future-proof account abstraction (ERC-4337, ERC-7702, etc.) and x402 paid HTTP API execution.

## Core Features

- **Brain**: Converts natural language into formal `Intent` structs (ERC-7521 inspired) using Groq (LLaMA 3).
- **Planner**: Maps deterministic intent actions to execution steps (Blockchain Calls, API Fetches, Payment Challenges).
- **Execution Engine**: Processes steps, interacting with viem contracts or REST APIs.
- **x402 Adapters**: Intercepts 402 Payment Required responses from APIs, pays the toll onchain, and retries the HTTP call transparently.
- **Viem-Only**: No ethers.js bloat. Fully compatible with `viem` standard helpers.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill out keys.
   - Requires `GROQ_API_KEY` for natural language intent parsing.
   - `PRIVATE_KEY` defaults to anvil account 0 if not provided.
3. Start the dev agent:
   ```bash
   npm run dev
   ```

## Next-Gen Smart Account Readiness

The current MVP uses standard EOA signers in `src/blockchain/clients.ts`.
To support ERC-4337 / ERC-7702 / ERC-7579 modular smart accounts, the architecture is isolated:
1. Update `src/blockchain/clients.ts` to construct a `SmartAccountClient` instead of `WalletClient`.
2. Update `src/blockchain/helpers.ts` to convert `executeTransaction` calls into `sendUserOperation` batches. The planning layer doesn't need to know!

## Running Tests

We use Vitest for lightning fast execution:
```bash
npm run test
```
