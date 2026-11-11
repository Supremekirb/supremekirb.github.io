// @ts-check
import fs from 'node:fs';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: "https://bitdragon.dev",
  output: "static",
  markdown: {
    shikiConfig: {
      theme: 'catppuccin-mocha',
      langs: [
        () => JSON.parse(fs.readFileSync('src/misc/ccscript.tmLanguage.json', 'utf-8'))
      ],
      langAlias: {
        ccs: "CCScript"
      }
    },
  },
});
