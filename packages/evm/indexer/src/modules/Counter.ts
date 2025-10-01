import { Counter_Increment, Counter_IncrementBy, DiamondProxy } from 'generated';

DiamondProxy.Increment.handler(async ({ event, context }) => {
  const entity: Counter_Increment = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    newAmount: event.params.newValue,
    timestamp: BigInt(event.block.timestamp * 1000),
  };
  context.Counter_Increment.set(entity);
});

DiamondProxy.IncrementBy.handler(async ({ event, context }) => {
  const entity: Counter_IncrementBy = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    amount: event.params.newValue,
    by: event.params.by,
    timestamp: BigInt(event.block.timestamp * 1000),
  };
  context.Counter_IncrementBy.set(entity);
});
