// GTA VI Trophy Guide & Tracker — build script.
//
// Copies app/ and screenshots/ into the output directory and writes
// /output/dossier.json with the scorer's own buildDossier helper from
// vendor/makefun-frontend.ts (that file is the kit's library, left untouched).
// Run twice and the output is byte-identical.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// (Outside the grader's container MAKEFUN_OUTPUT_DIR stands in for /output.)

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output dir so a stale file can never leak into the entry.
if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// The static app: index.html + style.css + app.js + data/*.json.
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });

// Screenshots of the real rendered app (the cover is first by name).
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps (reference/gate.json): text_max_bytes shapes the dossier
// text; the others refuse an entry the scorer would refuse — more than 4
// screenshots, one over 256 KiB, more than 993 files/dirs in app/, or app/
// over 48 MiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(`Built ${out}: app/ + screenshots/ + dossier.json`);
