/** Keep standalone repository builds self-contained; www owns the shared tokens. */
import {readFile, writeFile} from 'node:fs/promises';
const source = new URL('../css/theme-tokens.css', import.meta.url);
const target = new URL('../../web-tools/src/css/theme-tokens.css', import.meta.url);
const generated = (await readFile(source, 'utf8')).replace('/* Canonical cross-site theme. Run scripts/sync-theme.mjs after editing. */', '/* Generated from www/css/theme-tokens.css by www/scripts/sync-theme.mjs. */');
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== generated) throw new Error('Shared theme tokens are stale. Run node scripts/sync-theme.mjs.');
  console.log('Shared theme tokens match.');
} else { await writeFile(target, generated); console.log('Updated Web Tools theme tokens.'); }
