import { Counter_Increment, Counter_IncrementBy, DiamondProxy } from 'generated';

DiamondProxy.Increment.handler(async ({ event, context }) => {
  const entity: Counter_Increment = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    by: event.params._0,
  };
  context.Counter_Increment.set(entity);
});

DiamondProxy.IncrementBy.handler(async ({ event, context }) => {
  const entity: Counter_IncrementBy = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    amount: event.params._0,
    by: event.params._1,
  };
  context.Counter_IncrementBy.set(entity);
});
