import cors from '@fastify/cors';
import Fastify from 'fastify';
import { http, createPublicClient } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { deployErc20Token } from './helpers/erc20-utils.ts';
import { getAnvilWalletClient, getChain } from './helpers/utils.ts';
import { createRpcHandler } from './relay.ts';
import { deployPaymasters } from './singletonPaymasters.ts';

export const startPaymaster = async () => {
  console.log('Starting mock singleton paymaster...');
  const app = Fastify({});
  const anvilRpc = 'http://localhost:8545';
  const altoRpc = 'http://localhost:4337/1';
  const chain = await getChain(anvilRpc);

  const walletClient = await getAnvilWalletClient({
    anvilRpc,
    addressIndex: 1,
  });
  const publicClient = createPublicClient({
    transport: http(anvilRpc),
    chain,
  });
  const bundler = createBundlerClient({
    chain,
    transport: http(altoRpc),
  });

  await deployPaymasters({ walletClient, publicClient });
  await deployErc20Token(walletClient, publicClient);

  app.register(cors, {
    origin: '*',
    methods: ['POST', 'GET', 'OPTIONS'],
  });

  const rpcHandler = createRpcHandler({
    bundler,
    publicClient,
    paymasterSigner: walletClient,
  });
  app.post('/', {}, rpcHandler);

  app.get('/ping', async (_request, reply) => {
    return reply.code(200).send({ message: 'pong' });
  });

  await app.listen({ host: '0.0.0.0', port: 4338 });
};
