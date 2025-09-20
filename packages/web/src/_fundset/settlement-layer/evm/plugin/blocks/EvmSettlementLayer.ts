import type { Block } from 'payload';

const AaModule: Block = {
  slug: 'evm-aa-module',
  dbName: 'aa',
  fields: [
    {
      name: 'paymasterUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'entryPointAddress',
      type: 'text',
      required: true,
    },
    {
      name: 'bundlerUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'providers',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'provider',
          type: 'select',
          required: true,
          options: [
            'google',
            'facebook',
            'reddit',
            'discord',
            'twitch',
            'apple',
            'line',
            'github',
            'kakao',
            'linkedin',
            'twitter',
            'weibo',
            'wechat',
            'farcaster',
            'email_passwordless',
            'sms_passwordless',
            'webauthn',
            'jwt',
            'passkeys',
            'authenticator',
          ].map(provider => ({
            label: provider.charAt(0).toUpperCase() + provider.slice(1),
            value: provider,
          })),
        },
        {
          name: 'mfaLevel',
          type: 'select',
          required: true,
          options: ['default', 'optional', 'mandatory', 'none'].map(mfaLevel => ({
            label: mfaLevel,
            value: mfaLevel,
          })),
        },
      ],
    },
  ],
};

const TokenModule: Block = {
  slug: 'evm-token-module',
  fields: [
    {
      name: 'contracts',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'token',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};

export const EvmSettlementLayer: Block = {
  slug: 'evm-settlement-layer',
  fields: [
    {
      name: 'chainConfigs',
      required: true,
      type: 'array',
      minRows: 1,
      dbName: 'chainConfigs',
      fields: [
        {
          name: 'rpcUrl',
          type: 'text',
          required: true,
        },
        {
          name: 'chainId',
          type: 'number',
          required: true,
        },
        {
          name: 'proxyAddress',
          type: 'text',
          required: true,
        },
        {
          name: 'modules',
          type: 'blocks',
          blocks: [AaModule, TokenModule],
          required: true,
        },
      ],
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'evm',
      required: true,
      options: [
        {
          label: 'evm',
          value: 'evm',
        },
      ],
    },
  ],
};
