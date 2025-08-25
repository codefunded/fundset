import { BasePayload } from 'payload';

export const seedAdminAccount = async (payload: BasePayload) => {
  const admin = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: 'admin@admin.com',
      },
    },
  });
  if (admin.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@admin.com',
        password: 'Admin1234',
      },
    });
    payload.logger.info('Admin user was created successfully. "admin@admin.com" / "Admin1234"');
  }
};
