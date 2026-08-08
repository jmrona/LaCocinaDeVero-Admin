/**
 * Derived columns kept in sync automatically, so the admin only ever shows
 * plain, obvious fields to the person editing the menu.
 *
 *  - `name`: assembled from name_es / name_en / name_de. The website reads
 *    dishes straight from Postgres, where a single JSON column is far simpler
 *    than a Strapi component in its own table — but a raw JSON editor is not
 *    something a non-technical user should be asked to fill in.
 *
 *  - `image`: the public URL of the uploaded `photo`, which is what the
 *    website renders.
 *
 *  - `display_name`: the Spanish name as plain text, because Strapi can't show
 *    JSON columns in lists or relation pickers.
 *
 *  - `dish_id`: a legacy identifier the website still uses. Nobody creating a
 *    dish can know which number is free, and a taken one breaks the unique
 *    constraint, so it's assigned here.
 */

const clean = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null;

/**
 * Builds the JSON name from the three per-language fields.
 * Blank translations are left out entirely rather than stored as empty
 * strings, so the website can fall back to Spanish for them.
 */
const buildName = (data: any, existing?: any) => {
  const es = clean(data?.name_es ?? existing?.name_es);
  const en = clean(data?.name_en ?? existing?.name_en);
  const de = clean(data?.name_de ?? existing?.name_de);
  if (!es) return null;

  const name: Record<string, string> = { es };
  if (en) name.en = en;
  if (de) name.de = de;
  return name;
};

const beforeWrite = async (event: any) => {
  const data = event.params?.data;
  if (!data) return;

  // Assign the next dish_id on creation.
  if (event.action === 'beforeCreate' && !data.dish_id) {
    const [{ max }] = await strapi.db.connection('cms_dishes').max('dish_id as max');
    data.dish_id = (max ?? 0) + 1;
  }

  // Only touch `name` when one of the language fields is part of this write.
  const touchesName =
    'name_es' in data || 'name_en' in data || 'name_de' in data;
  if (!touchesName) return;

  let existing: any = null;
  if (event.params?.where?.id) {
    existing = await strapi.db
      .query('api::dish.dish')
      .findOne({ where: { id: event.params.where.id } });
  }

  const name = buildName(data, existing);
  if (name) {
    data.name = name;
    data.display_name = name.es;
  }
};

const afterWrite = async (event: any) => {
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

export default {
  beforeCreate: beforeWrite,
  beforeUpdate: beforeWrite,
  afterCreate: afterWrite,
  afterUpdate: afterWrite,
};
