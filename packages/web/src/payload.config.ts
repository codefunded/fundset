// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig, SharpDependency } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users } from './features/cms/collections/Users';
import { Media } from './features/cms/collections/Media';
import { seedAdminAccount } from './features/cms/payload.seed';

import { fundsetBasePlugin } from '@/_fundset/base-plugin';
import { pgSettlementLayerPlugin } from '@/_fundset/settlement-layer/pg/plugin';
import { evmSettlementLayerPlugin } from '@/_fundset/settlement-layer/evm/plugin';
import { env } from './env';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  globals: [],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URI,
    },
  }),
  localization: {
    defaultLocale: 'en',
    defaultLocalePublishOption: 'active',
    locales: ['en', 'pl'],
    fallback: true,
  },
  sharp: sharp as SharpDependency,
  plugins: [
    fundsetBasePlugin(),
    pgSettlementLayerPlugin(),
    evmSettlementLayerPlugin(),
    // storage-adapter-placeholder
  ],
  onInit: async payload => {
    if (process.env.NODE_ENV === 'development') {
      await seedAdminAccount(payload);
    }
  },
});
