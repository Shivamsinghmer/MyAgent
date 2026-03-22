import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, sepolia } from 'viem/chains';
import { env } from '../utils/env';

// For MVP, default to Sepolia if testing, Mainnet if production.
const chain = process.env.NODE_ENV === 'production' ? mainnet : sepolia;

// Initialize public client for reading state
export const publicClient = createPublicClient({
  chain,
  transport: http(env.RPC_URL || undefined),
});

// Mock/Local dev wallet when no PK is provided
const DEFAULT_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Anvil account 0

// Initialize wallet client for transactions
const account = privateKeyToAccount((env.PRIVATE_KEY as `0x${string}`) || DEFAULT_PK);

export const walletClient = createWalletClient({
  account,
  chain,
  transport: http(env.RPC_URL || undefined),
});

/**
 * Note on Future-Proofing for Smart Accounts:
 * To support ERC-4337, ERC-7579, or ERC-7702, we would wrap this standard WalletClient
 * into a SmartAccountClient (using packages like permissionless.js or viem's upcoming extensions).
 * All blockchain interactions should use the helpers below to allow swapping out standard
 * transaction formats with `UserOperations` or delegated calls transparently later.
 */
