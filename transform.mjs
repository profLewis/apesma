// APESMA TRANSFORM - turns Music Assistant's own web app (github.com/music-assistant/frontend, at the version the running
// Music Assistant uses) into apesma: the same app, served by Home Assistant, with a 🍌 Peach Banana button.
// Every change is a NAMED edit at a spot found by its text. If an upstream release moves or rewrites a spot, the edit
// fails LOUDLY (and the build with it) - so a release is never shipped half-changed. Then this file is updated.
//   node transform.mjs <path to the upstream checkout>
import fs from 'node:fs';
import path from 'node:path';

const up = process.argv[2];
if (!up || !fs.existsSync(path.join(up, 'package.json'))) { console.error('usage: node transform.mjs <frontend checkout>'); process.exit(2); }
const here = path.dirname(new URL(import.meta.url).pathname);
const report = [];
let failed = 0;

function edit(name, file, find, replace, { min = 1, max = Infinity } = {}) {
  const f = path.join(up, file);
  if (!fs.existsSync(f)) { report.push(`✗ ${name}: ${file} is gone`); failed++; return; }
  const t = fs.readFileSync(f, 'utf8');
  const re = find instanceof RegExp ? new RegExp(find.source, find.flags.includes('g') ? find.flags : find.flags + 'g') : null;
  const n = re ? (t.match(re) || []).length : t.split(find).length - 1;
  if (n < min || n > max) { report.push(`✗ ${name}: found ${n} time(s) in ${file} (expected ${min}${max === Infinity ? '+' : '-' + max})`); failed++; return; }
  fs.writeFileSync(f, re ? t.replace(re, replace) : t.split(find).join(replace));
  report.push(`✓ ${name} (${n}× in ${file})`);
}

function copyFiles() {   // our own new files (files/ → the checkout)
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of walk(path.join(here, 'files'))) {
    const rel = path.relative(path.join(here, 'files'), f), to = path.join(up, rel);
    fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(f, to); report.push(`✓ added ${rel}`);
  }
}

copyFiles();

// 1. INGRESS FROM HOME ASSISTANT: "is this an ingress session?" also yes when apesma was given HA's ingress path
edit('ingress: apesma counts as ingress', 'src/helpers/ingress.ts',
  'return window.location.pathname.includes("/hassio_ingress/");',
  'return !!apesmaIngress || window.location.pathname.includes("/hassio_ingress/");', { max: 1 });
edit('ingress: import', 'src/helpers/ingress.ts',
  /^(import type .*?\n)/m, '$1import { apesmaIngress } from "@/helpers/apesma";\n', { max: 1 });

// 2. THE SERVER ADDRESS: "where this page came from" → the Music Assistant address apesma was given
edit('server address', 'src/views/Login.vue',
  /window\.location\.origin \+ window\.location\.pathname\.replace\(\/\\\/\$\/, ""\)/,
  'apesmaServerBase()', { min: 2 });
edit('server address: import', 'src/views/Login.vue',
  'import { useRouter } from "vue-router";', 'import { useRouter } from "vue-router";\nimport { apesmaServerBase } from "@/helpers/apesma";', { max: 1 });

// 3. THE 🍌 PEACH BANANA BUTTON at the bottom of the side menu (next to the "Home Assistant" one)
edit('server websocket', 'src/views/Login.vue',   // (the first connection: to the server's address, not this page's - the same unless apesmaDirect)
  'const localWsUrl = getWebSocketUrlFromLocation();', 'const localWsUrl = buildWebSocketUrl(apesmaServerBase());', { min: 1, max: 1 });
edit('🍌 button', 'src/components/navigation/AppSidebar.vue',
  '<NavHomeAssistant v-if="haState.kioskModeEnabled" />',
  '<NavPeachBanana />\n      <NavHomeAssistant v-if="haState.kioskModeEnabled" />', { max: 1 });
edit('🍌 button: import', 'src/components/navigation/AppSidebar.vue',
  'import NavHomeAssistant from "./NavHomeAssistant.vue";',
  'import NavHomeAssistant from "./NavHomeAssistant.vue";\nimport NavPeachBanana from "./NavPeachBanana.vue";', { max: 1 });

// 4. ITS NAME in the browser tab
edit('title', 'index.html', /<title>[^<]*<\/title>/, '<title>apesma</title>', { max: 1 });

console.log(report.join('\n'));
fs.writeFileSync(path.join(up, 'APESMA_TRANSFORM.txt'), report.join('\n') + '\n');
if (failed) { console.error(`\n${failed} edit(s) failed - this Music Assistant app version needs transform.mjs updating`); process.exit(1); }
