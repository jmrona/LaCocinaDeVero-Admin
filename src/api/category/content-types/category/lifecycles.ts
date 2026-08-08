/**
 * Mirrors the Spanish name into `display_name`.
 *
 * `name` is a JSON field with all three languages, and Strapi can't show JSON
 * fields in lists or relation pickers — without this, assigning a category to
 * a dish only showed its emoji.
 */
const syncDisplayName = async (event: any) => {
  const id = event?.result?.id;
  if (!id) return;

  const entry = await strapi.db.query('api::category.category').findOne({ where: { id } });
  if (!entry) return;

  const spanishName = entry.name?.es ?? null;
  if (!spanishName || spanishName === entry.display_name) return;

  await strapi.db.query('api::category.category').update({
    where: { id },
    data: { display_name: spanishName },
  });
};

export default {
  afterCreate: syncDisplayName,
  afterUpdate: syncDisplayName,
};
