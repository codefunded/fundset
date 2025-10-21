import { counterModule } from '../../modules/counter/pg/orpc';

export const router = {
  ...counterModule,
};
