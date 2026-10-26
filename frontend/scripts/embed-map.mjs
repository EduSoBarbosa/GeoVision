/** Bundle Leaflet source into the shared HTML surface, avoiding a runtime CDN. */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const leaflet = resolve(root, 'node_modules/leaflet/dist');
const js = readFileSync(resolve(leaflet, 'leaflet.js'), 'utf8');
const css = readFileSync(resolve(leaflet, 'leaflet.css'), 'utf8');
const output = resolve(root, 'src/vendor');
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, 'leafletAssets.js'), '// Generated from Leaflet 1.9.4 (BSD-2-Clause). See THIRD_PARTY.md.\n' + `export const LEAFLET_JS = ${JSON.stringify(js)};\nexport const LEAFLET_CSS = ${JSON.stringify(css)};\n`);
