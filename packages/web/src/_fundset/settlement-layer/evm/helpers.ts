import { evmSettlementLayerEnv } from './env';
import { graphql } from 'gql.tada';
import { request } from 'graphql-request';

const env = evmSettlementLayerEnv();

export const isTransactionIndexed = async (hash: string) => {
  const isTransactionIndexedQuery = graphql(`
    query IsTransactionIndexed($hash: String!) {
      raw_events(where: { transaction_fields: { _cast: { String: { _iregex: $hash } } } }) {
        transaction_fields
        serial
      }
    }
  `);
  const isTransactionIndexedResult = await request(
    env.NEXT_PUBLIC_INDEXER_URL,
    isTransactionIndexedQuery,
    {
      hash,
    },
  );
  return isTransactionIndexedResult.raw_events.length > 0;
};

/**
 * Check if a transaction is indexed by the indexer. It tries to fetch the transaction 8 times with a 1 second delay, if not found during this time, it returns false.
 * @param hash transaction hash to check
 */
export const waitForTransactionToBeIndexed = async (hash: string) => {
  for (let i = 0; i < 8; i++) {
    try {
      const isTransactionIndexedResult = await isTransactionIndexed(hash);
      if (!isTransactionIndexedResult) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      return true;
    } catch (error) {
      console.error('Transaction not indexed', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
};
