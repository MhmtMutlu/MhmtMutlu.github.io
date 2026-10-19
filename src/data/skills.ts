import type { Locale } from '../i18n/ui';

export interface SkillGroup {
  title: Record<Locale, string>;
  items: string[];
}

export const skills: SkillGroup[] = [
  { title: { en: 'Languages', tr: 'Diller' }, items: ['JavaScript (ES6+)', 'TypeScript', 'SQL', 'Java (basic)'] },
  {
    title: { en: 'Frontend', tr: 'Frontend' },
    items: ['Angular', 'AngularJS', 'React', 'Next.js', 'Lit', 'Web Components', 'React Native', 'RxJS', 'Zustand', 'Redux', 'TanStack Query', 'jQuery', 'JSP', 'SCSS', 'Tailwind CSS', 'Three.js'],
  },
  { title: { en: 'Backend & API', tr: 'Backend & API' }, items: ['Node.js', 'Express', 'RESTful APIs', 'GraphQL', 'OpenAPI', 'NGINX'] },
  {
    title: { en: 'AI-assisted development', tr: 'Yapay zekâ destekli geliştirme' },
    items: ['Cursor', 'Claude Code', 'Gemini', 'LLM workflows', 'Prompt design'],
  },
];
