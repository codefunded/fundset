import { BasePayload } from 'payload';

export const seed = async (payload: BasePayload) => {
  await payload.updateGlobal({
    slug: 'theme',
    data: {
      editor: true,
    },
  });
};
