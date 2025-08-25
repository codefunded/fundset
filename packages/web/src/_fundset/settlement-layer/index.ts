'use client';

import { createContext, useContext } from 'react';
import type { SettlementLayer } from 'fundset/settlement-layer';
import { SettlementLayerConfig } from './provider/config.type';

export type SettlementLayerName = SettlementLayerConfig['type'];

export const SettlementLayerContext = createContext<SettlementLayerName[]>([]);

export const useSettlementLayer = (name?: string) => {
  /**
   * THIS IS A HACKY WAY OF SYNCHRONOUSLY AND DYNAMICALLY IMPORT THE SETTLEMENT LAYER IMPLEMENTATION
   *
   * It's a workaround to avoid having explicit imports for each settlement layer implementation.
   * Now, when you switch the SL in admin panel, this will use the first one from the list.
   */

  const context = useContext(SettlementLayerContext);
  if (!context.length) {
    throw new Error('useSettlementLayer must be used within a SettlementLayerProvider');
  }
  const defaultName = context.at(0)!;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const useSL = require(
    `@/_fundset/settlement-layer/${name ?? defaultName}/useSettlementLayerImplementation`,
  );

  return useSL.default() as SettlementLayer;
};
