// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import cleck from '@clerk/astro'
import { esES } from '@clerk/localizations'


import react from '@astrojs/react';


// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [cleck({
    localization: esES
  }), react()],
  output: "static",
  adapter: vercel()
});