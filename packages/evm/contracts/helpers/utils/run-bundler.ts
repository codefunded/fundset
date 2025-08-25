import { createServer } from 'prool';
import { alto } from 'prool/instances';
import { entryPoint07Address } from 'viem/account-abstraction';
import { waitForNetworkToBeReady } from './wait-for-network-ready.ts';

const localhostRpc = `http://localhost:8545`;
const firstAnvilAccountPrivateKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const PORT = 4337;

export async function runBundler() {
  await waitForNetworkToBeReady();

  const altoServer = createServer({
    instance: () =>
      alto({
        entrypoints: [entryPoint07Address],
        rpcUrl: localhostRpc,
        executorPrivateKeys: [firstAnvilAccountPrivateKey],
        utilityPrivateKey: firstAnvilAccountPrivateKey,
        enableDebugEndpoints: true,
        safeMode: false,
        logLevel: 'debug',
        bundleMode: 'auto',
      }),
    limit: 1,
    port: PORT,
  });

  await altoServer.start();
  console.log(`Alto server started on http://localhost:${PORT}/1`);

  const stopServer = async () => {
    try {
      await altoServer.stop();
    } catch (error) {
      console.error('Error stopping server:', error);
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', stopServer);
  process.on('SIGTERM', stopServer);
  process.on('uncaughtException', async error => {
    console.error('Uncaught exception:', error);
    await stopServer();
  });
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    await stopServer();
  });
}
