/**
 * Mirrors the Spanish name into `display_name`.
 *
 * `name` is a JSON field with all three languages, and Strapi can't show JSON
 * fields in relation pickers — without this, assigning allergens to a dish
 * showed opaque ids like "00ccf385...", which is an easy way to tag the wrong
 * allergen on a dish.
 */
const syncDisplayName = async (event: any) => {
  const id = event?.result?.id;
  if (!id) return;

  const entry = await strapi.db.query('api::allergen.allergen').findOne({ where: { id } });
  if (!entry) return;

  const spanishName = entry.name?.es ?? null;
  if (!spanishName || spanishName === entry.display_name) return;

  await strapi.db.query('api::allergen.allergen').update({
    where: { id },
    data: { display_name: spanishName },
  });
};

export default {
  afterCreate: syncDisplayName,
  afterUpdate: syncDisplayName,
};
