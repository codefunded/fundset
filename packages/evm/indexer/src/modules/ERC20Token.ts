import { ERC20, ERC20_OwnershipTransferred, ERC20_Transfer } from 'generated';

ERC20.Transfer.handler(async ({ event, context }) => {
  const entity: ERC20_Transfer = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    from: event.params._0,
    to: event.params._1,
    value: event.params._2,
  };
  context.ERC20_Transfer.set(entity);
});

ERC20.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: ERC20_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    newOwner: event.params._0,
    previousOwner: event.params._1,
  };
  context.ERC20_OwnershipTransferred.set(entity);
});
