'use client';

import { SettlementLayerContext, SettlementLayerName } from '..';

export const ClientSideSettlementLayerProvider = ({
  children,
  settlementLayerNames,
}: React.PropsWithChildren<{
  settlementLayerNames: SettlementLayerName[];
}>) => {
  return (
    <SettlementLayerContext.Provider value={settlementLayerNames}>
      {children}
    </SettlementLayerContext.Provider>
  );
};
