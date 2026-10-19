import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    key: z.string(),
    locale: z.enum(['en', 'tr']),
    year: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    order: z.number().default(99),
    url: z.url().optional(),
    repo: z.url().optional(),
    accent: z.string().default('#2563eb'),
  }),
});

export const collections = { projects };
