import type { Core } from '@strapi/strapi';

// Supabase Storage host that serves the uploaded media. The admin panel's
// default CSP only allows 'self', which would blank out every image preview.
const storageHost = process.env.SUPABASE_STORAGE_PUBLIC_URL
  ? new URL(process.env.SUPABASE_STORAGE_PUBLIC_URL).host
  : null;

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', ...(storageHost ? [storageHost] : [])],
          'media-src': ["'self'", 'data:', 'blob:', ...(storageHost ? [storageHost] : [])],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
