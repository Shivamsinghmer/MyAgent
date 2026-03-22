import * as readline from 'readline';
import { parseIntent } from './agent/brain.js';
import { createPlan } from './planner/planner.js';
import { ExecutionEngine } from './execution/engine.js';
import { logger } from './utils/logger.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runLoop() {
  logger.info('--- Autonomous Onchain Agent MVP V1 ---');
  rl.question('> You: ', async (input) => {
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      logger.info('Agent shutting down.');
      rl.close();
      return;
    }

    try {
      // 1. Brain -> Intent
      const intent = await parseIntent(input);

      // 2. Intent -> Plan
      const plan = await createPlan(intent);

      // 3. Plan -> Execution
      const engine = new ExecutionEngine();
      logger.info('Starting plan execution...');
      await engine.run(plan);

    } catch (e: any) {
      logger.error('Error during processing loop:', e);
    }

    console.log('\n');
    runLoop(); // restart loop recursively
  });
}

function start() {
  runLoop();
}

// Start the agent
start();
