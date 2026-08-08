/**
 * Keeps the `image` string column in sync with the uploaded `photo` media field.
 *
 * The website reads dishes straight from Postgres (PostgREST), where a plain
 * URL column is far simpler to consume than Strapi's polymorphic media tables.
 * So the admin uploads a photo the normal way, and we mirror its public URL
 * into `image` for the site to read.
 */

const syncImageFromPhoto = async (event: any) => {
  const id = event?.result?.id;
  if (!id) return;

  const entry = await strapi.db.query('api::dish.dish').findOne({
    where: { id },
    populate: { photo: true },
  });
  if (!entry) return;

  const photoUrl = entry.photo?.url ?? null;

  // Only write when it actually differs, otherwise this update would
  // re-trigger the lifecycle and loop.
  if (photoUrl && photoUrl !== entry.image) {
    await strapi.db.query('api::dish.dish').update({
      where: { id },
      data: { image: photoUrl },
    });
  }
};

export default {
  afterCreate: syncImageFromPhoto,
  afterUpdate: syncImageFromPhoto,
};
