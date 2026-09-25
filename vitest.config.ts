/// <reference types="vitest/config" />
// getViteConfig lets vitest compile .astro files (Astro Container API in tests/public-site.test.ts).
import { getViteConfig } from 'astro/config';
export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/labs/**'],
  },
});
