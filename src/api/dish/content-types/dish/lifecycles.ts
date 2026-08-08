/**
 * Keeps two derived columns in sync after every save:
 *
 *  - `image`: the public URL of the uploaded `photo`. The website reads dishes
 *    straight from Postgres (PostgREST), where a plain URL column is far
 *    simpler to consume than Strapi's polymorphic media tables.
 *
 *  - `display_name`: the Spanish name as plain text. `name` is a JSON field
 *    holding all three languages, and Strapi's list view can't display JSON
 *    columns, so without this the dish list has no readable name column.
 */

const syncDerivedFields = async (event: any) => {
  const id = event?.result?.id;
  if (!id) return;

  const entry = await strapi.db.query('api::dish.dish').findOne({
    where: { id },
    populate: { photo: true },
  });
  if (!entry) return;

  const updates: Record<string, unknown> = {};

  const photoUrl = entry.photo?.url ?? null;
  if (photoUrl && photoUrl !== entry.image) updates.image = photoUrl;

  const spanishName = entry.name?.es ?? null;
  if (spanishName && spanishName !== entry.display_name) updates.display_name = spanishName;

  // Only write when something actually changed, otherwise this update would
  // re-trigger the lifecycle and loop.
  if (Object.keys(updates).length === 0) return;

  await strapi.db.query('api::dish.dish').update({ where: { id }, data: updates });
};

/**
 * Assigns the next `dish_id` automatically.
 *
 * It's a legacy identifier the website still uses, but nobody creating a dish
 * in the admin can be expected to know which number is free — and picking one
 * that's taken would fail on the unique constraint.
 */
const assignDishId = async (event: any) => {
  const data = event.params?.data;
  if (!data || data.dish_id) return;

  const [{ max }] = await strapi.db
    .connection('cms_dishes')
    .max('dish_id as max');

  data.dish_id = (max ?? 0) + 1;
};

export default {
  beforeCreate: assignDishId,
  afterCreate: syncDerivedFields,
  afterUpdate: syncDerivedFields,
};
