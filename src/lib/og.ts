import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const fontDir = resolve(process.cwd(), 'node_modules/@fontsource/instrument-serif/files');
let fonts: { name: string; data: ArrayBuffer; weight: 400; style: 'normal' | 'italic' }[] | null = null;

async function loadFonts() {
  if (fonts) return fonts;
  const load = async (f: string) => {
    const buf = await readFile(resolve(fontDir, f));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  };
  fonts = [
    { name: 'Instrument Serif', data: await load('instrument-serif-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Instrument Serif Ext', data: await load('instrument-serif-latin-ext-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Instrument Serif', data: await load('instrument-serif-latin-400-italic.woff'), weight: 400, style: 'italic' },
    { name: 'Instrument Serif Ext', data: await load('instrument-serif-latin-ext-400-italic.woff'), weight: 400, style: 'italic' },
  ];
  return fonts;
}

export interface OgInput {
  title: string;
  subtitle: string;
  eyebrow: string;
  accent?: string;
  tags?: string[];
}

export async function renderOg({ title, subtitle, eyebrow, accent = '#2563eb', tags = [] }: OgInput): Promise<Buffer> {
  const f = await loadFonts();
  const el = {
    type: 'div',
    props: {
      style: {
        width: '1200px', height: '630px', display: 'flex', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #060a12 0%, #0b1324 55%, #081a1f 100%)', color: '#eef0f7', fontFamily: 'Instrument Serif, Instrument Serif Ext',
      },
      children: [
        { type: 'div', props: { style: { position: 'absolute', left: '-200px', top: '-260px', width: '900px', height: '900px', background: 'radial-gradient(circle, rgba(16,48,107,0.95) 0%, rgba(16,48,107,0) 60%)' } } },
        { type: 'div', props: { style: { position: 'absolute', right: '-260px', bottom: '-320px', width: '1000px', height: '1000px', background: `radial-gradient(circle, ${accent}B3 0%, ${accent}00 60%)` } } },
        { type: 'div', props: { style: { position: 'absolute', left: '300px', bottom: '-420px', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(11,74,74,0.9) 0%, rgba(11,74,74,0) 60%)' } } },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute', left: '48px', top: '48px', width: '976px', height: '422px', borderRadius: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 64px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)',
            },
            children: [
              { type: 'div', props: { style: { fontSize: '22px', letterSpacing: '6px', textTransform: 'uppercase', color: '#9aa0b5' }, children: eyebrow } },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '18px' },
                  children: [
                    { type: 'div', props: { style: { fontSize: title.length > 40 ? '68px' : '88px', lineHeight: 1, letterSpacing: '-2px', maxWidth: '980px' }, children: title } },
                    { type: 'div', props: { style: { fontSize: '30px', lineHeight: 1.3, color: '#b9bed0', maxWidth: '900px', fontStyle: 'italic' }, children: subtitle } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
                  children: [
                    { type: 'div', props: { style: { display: 'flex', gap: '10px' }, children: tags.slice(0, 5).map((t) => ({ type: 'div', props: { style: { fontSize: '20px', padding: '8px 16px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: '#d7dbe8' }, children: t } })) } },
                    { type: 'div', props: { style: { fontSize: '26px', color: '#eef0f7' }, children: 'Mehmet Mutlu' } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
  // @ts-expect-error satori accepts a React-like element tree
  const svg = await satori(el, { width: 1200, height: 630, fonts: f });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return Buffer.from(png);
}
