import { profile } from './profile';

export interface SocialLink {
  label: string;
  href: string;
  /** Lucide-style 24×24 stroke path(s). */
  icon: string;
}

export const social: SocialLink[] = [
  {
    label: 'GitHub',
    href: profile.github,
    icon: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5 5 0 0 0 19.9 1S18.7.6 16 2.5a13.4 13.4 0 0 0-7 0C6.3.6 5.1 1 5.1 1A5 5 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.3 6.6 6.4 7a3.4 3.4 0 0 0-.9 2.6V23"/>',
  },
  {
    label: 'LinkedIn',
    href: profile.linkedin,
    icon: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  },
  {
    label: 'Medium',
    href: profile.medium,
    icon: '<circle cx="7" cy="12" r="5"/><ellipse cx="16.5" cy="12" rx="2.5" ry="5"/><ellipse cx="21.5" cy="12" rx="1" ry="4.5"/>',
  },
];
