import type { GlobalConfig } from 'payload';

export const Theme: GlobalConfig = {
  slug: 'theme',
  fields: [
    {
      name: 'theme',
      type: 'textarea',
      defaultValue: '',
    },
    {
      name: 'editor',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
  ],
};
