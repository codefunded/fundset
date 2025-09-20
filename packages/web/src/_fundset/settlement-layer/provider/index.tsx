import { ClientSideSettlementLayerProvider } from './client';
import { SettlementLayerConfig } from './config.type';

export { useSettlementLayer } from '..';

export const SettlementLayerProvider = async ({
  children,
  configs,
}: React.PropsWithChildren<{
  configs: SettlementLayerConfig[];
}>) => {
  const ProviderComponentsWithConfigs = await Promise.all(
    configs.map(async config => {
      const { default: ParticularSettlementLayerProvider } = await import(
        `../${config.type}/index.tsx`
      );
      if (!ParticularSettlementLayerProvider) {
        throw new Error(`Unsupported settlement layer type: ${config.type}`);
      }
      return {
        ParticularSettlementLayerProvider:
          ParticularSettlementLayerProvider as React.ComponentType<{
            config: SettlementLayerConfig;
            children: React.ReactNode;
          }>,
        config,
      };
    }),
  );

  const SettlementLayerProviders = ProviderComponentsWithConfigs.toReversed().reduce(
    (renderChildren, { ParticularSettlementLayerProvider, config }) => {
      // eslint-disable-next-line react/display-name
      return ({ children }: { children: React.ReactNode }) => (
        <ParticularSettlementLayerProvider key={config.type} config={config}>
          {renderChildren({ children })}
        </ParticularSettlementLayerProvider>
      );
    },
    ({ children }: { children: React.ReactNode }) => children,
  );

  return (
    <SettlementLayerProviders>
      <ClientSideSettlementLayerProvider settlementLayerNames={configs.map(config => config.type)}>
        {children}
      </ClientSideSettlementLayerProvider>
    </SettlementLayerProviders>
  );
};
