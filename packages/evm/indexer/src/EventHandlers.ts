/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */

import {
  DiamondProxy,
  DiamondProxy_DiamondCut,
  DiamondProxy_OwnershipTransferred,
} from 'generated';
import './modules';

DiamondProxy.DiamondCut.handler(async ({ event, context }) => {
  for (const facetCut of event.params._0) {
    const [facetAddress, action, functionSelectors] = facetCut;
    const entity: DiamondProxy_DiamondCut = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      diamondAction: action,
      init: event.params._1,
      calldata: event.params._2,
      facetAddress: facetAddress.toString(),
      functionSelectors: functionSelectors.map(selector => selector.toString()),
    };
    context.DiamondProxy_DiamondCut.set(entity);
  }
});

DiamondProxy.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: DiamondProxy_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    newOwner: event.params._0,
    previousOwner: event.params._1,
  };
  context.DiamondProxy_OwnershipTransferred.set(entity);
});
