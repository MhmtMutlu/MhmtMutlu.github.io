/**
 * Generates Open Graph images into public/og ahead of `astro build`.
 * Runs as a separate process because resvg-js cannot be loaded alongside Tailwind's native engine.
 */
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { renderOg } from '../src/lib/og.ts';
import { ui } from '../src/i18n/ui.ts';

const root = process.cwd();
const out = resolve(root, 'public/og');

function frontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  const data = {};
  if (!m) return data;
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (v.startsWith('[')) v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    else v = v.replace(/^["']|["']$/g, '');
    data[k] = v;
  }
  return data;
}

async function write(rel, input) {
  const file = resolve(out, rel);
  await mkdir(resolve(file, '..'), { recursive: true });
  await writeFile(file, await renderOg(input));
  console.log('og ✓', rel);
}

for (const locale of ['en', 'tr']) {
  const t = ui[locale];
  await write(`${locale}/home.png`, {
    eyebrow: locale === 'tr' ? 'Senior Frontend Developer · İstanbul' : 'Senior Frontend Developer · Istanbul',
    title: `${t['hero.title.1']} ${t['hero.title.2']}`,
    subtitle: t['hero.lead'],
    tags: ['Angular', 'TypeScript', 'Lit', 'React', 'Next.js'],
  });
  const dir = resolve(root, 'src/content/projects', locale);
  for (const f of await readdir(dir)) {
    if (!f.endsWith('.md')) continue;
    const d = frontmatter(await readFile(resolve(dir, f), 'utf8'));
    await write(`${locale}/projects/${d.key}.png`, { eyebrow: `${t['projects.eyebrow']} · ${d.year}`, title: d.title, subtitle: d.summary, tags: d.stack ?? [], accent: d.accent });
  }
}
await write('en/404.png', { eyebrow: '404', title: ui.en['404.title'], subtitle: ui.en['404.lead'], tags: [] });
