import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    // Spanish admin UI for the restaurant owner. English stays available in
    // the profile settings for anyone who prefers it.
    locales: ['es'],
  },
  bootstrap(app: StrapiApp) {},
};
