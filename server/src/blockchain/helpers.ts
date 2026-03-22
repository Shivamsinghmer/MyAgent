import {
  Address,
  EncodeFunctionDataParameters,
  encodeFunctionData,
  SimulateContractParameters,
  SimulateContractReturnType,
  parseEther,
  formatEther
} from 'viem';
import { publicClient, walletClient } from './clients';
import { logger } from '../utils/logger';

/**
 * Execute a transaction block. Returns the txHash string on success.
 * Throws on failure or simulation failure.
 *
 * For ERC-4337 support, this function can later be adapted to wrap 
 * the transaction into a `sendUserOperation` call instead of a raw `sendTransaction`.
 */
export async function executeTransaction(params: {
  to: Address;
  data: `0x${string}`;
  value?: bigint;
}): Promise<string> {
  const account = walletClient.account;

  if (!account) {
    throw new Error('Wallet client missing account. Check configuration.');
  }

  // Next-gen support mapping: this is where we would check metadata
  // or Intent types (e.g. ERC-7521) and conditionally route to 
  // UserOps or standard sendTransaction.

  logger.info(`Simulating transaction to ${params.to}`);
  
  // Basic simulation to catch reverts early
  await publicClient.call({
    to: params.to,
    data: params.data,
    value: params.value,
    account: account.address,
  });

  logger.info(`Sending transaction starting...`);

  const txHash = await walletClient.sendTransaction({
    to: params.to,
    data: params.data,
    value: params.value,
  });

  logger.info(`Tx sent: ${txHash}. Waiting for receipt...`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  if (receipt.status === 'reverted') {
    throw new Error(`Transaction reverted: ${txHash}`);
  }

  logger.info(`Tx successful in block ${receipt.blockNumber}`);
  return txHash;
}

/**
 * Wrapper for simpler ETH transfers where calldata isn't required.
 */
export async function sendEth(to: Address, amountEth: string): Promise<string> {
  return executeTransaction({
    to,
    data: '0x',
    value: parseEther(amountEth),
  });
}

/**
 * Encodes contract function data reliably using viem.
 */
export function encodeCall(params: EncodeFunctionDataParameters): `0x${string}` {
  return encodeFunctionData(params);
}

/**
 * Gets a formatted native balance (e.g., "1.5" ETH).
 */
export async function getNativeBalance(address: Address): Promise<string> {
  const balance = await publicClient.getBalance({ address });
  return formatEther(balance);
}
