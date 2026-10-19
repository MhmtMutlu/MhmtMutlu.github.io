import type { Locale } from '../i18n/ui';

export interface ExperienceItem {
  company: string;
  url?: string;
  role: Record<Locale, string>;
  /** ISO month, e.g. 2022-12 */
  start: string;
  /** ISO month, or null while ongoing */
  end: string | null;
  tags: string[];
}

export const experience: ExperienceItem[] = [
  {
    company: 'sahibinden.com',
    url: 'https://www.sahibinden.com',
    role: { en: 'Senior Frontend Developer', tr: 'Senior Frontend Developer' },
    start: '2022-12',
    end: null,
    tags: ['Angular', 'AngularJS', 'TypeScript', 'Lit', 'Web Components', 'JSP', 'jQuery'],
  },
  {
    company: 'Innovance Consultancy',
    role: { en: 'Frontend Developer', tr: 'Frontend Developer' },
    start: '2021-10',
    end: '2022-12',
    tags: ['React', 'TypeScript', 'Node.js', 'Express', 'OpenAPI'],
  },
  {
    company: 'BB Bilişim',
    role: { en: 'Frontend Developer', tr: 'Frontend Developer' },
    start: '2021-08',
    end: '2021-10',
    tags: ['React', 'REST APIs'],
  },
];
