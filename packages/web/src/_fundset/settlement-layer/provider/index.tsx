import { ClientSideSettlementLayerProvider } from './client';
import { SettlementLayerConfig } from './config.type';

export const SettlementLayerProvider = async ({
  children,
  configs,
}: React.PropsWithChildren<{
  configs: SettlementLayerConfig[];
}>) => {
  const ProviderComponentsWithConfigs = await Promise.all(
    configs.map(async config => {
      const { default: ParticularSettlementLayerServerSideComponent } = await import(
        `../${config.type}/serverSideSettlementLayer.tsx`
      ).catch(() => {
        return { default: ({ children: c }: React.PropsWithChildren) => <>{c}</> };
      });
      const { default: ParticularSettlementLayerProvider } = await import(
        `../${config.type}/index.tsx`
      );
      if (!ParticularSettlementLayerProvider) {
        throw new Error(`Unsupported settlement layer type: ${config.type}`);
      }
      return {
        ParticularSettlementLayerServerSideComponent:
          ParticularSettlementLayerServerSideComponent as React.ComponentType<{
            config: SettlementLayerConfig;
            children: React.ReactNode;
          }>,
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
    (
      renderChildren,
      { ParticularSettlementLayerProvider, ParticularSettlementLayerServerSideComponent, config },
    ) => {
      // eslint-disable-next-line react/display-name
      return ({ children }: { children: React.ReactNode }) => (
        <ParticularSettlementLayerServerSideComponent key={config.type} config={config}>
          <ParticularSettlementLayerProvider key={config.type} config={config}>
            {renderChildren({ children })}
          </ParticularSettlementLayerProvider>
        </ParticularSettlementLayerServerSideComponent>
      );
    },
    ({ children }: { children: React.ReactNode }) => children,
  );

  return (
    <ClientSideSettlementLayerProvider settlementLayerNames={configs.map(config => config.type)}>
      <SettlementLayerProviders>{children}</SettlementLayerProviders>
    </ClientSideSettlementLayerProvider>
  );
};
