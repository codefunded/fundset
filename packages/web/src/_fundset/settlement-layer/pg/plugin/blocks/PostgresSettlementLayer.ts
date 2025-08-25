import type { Block } from 'payload';

export const PgSettlementLayer: Block = {
  slug: 'pg-settlement-layer',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'pg',
      required: true,
      options: [
        {
          label: 'pg',
          value: 'pg',
        },
      ],
    },
  ],
};
