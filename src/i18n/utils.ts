import { ui, defaultLocale, locales, type Locale, type UIKey } from './ui';
export type { Locale, UIKey };

export function getLocaleFromUrl(url: URL): Locale {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : url.pathname;
  const [, lang] = path.split('/');
  if (lang && (locales as readonly string[]).includes(lang)) return lang as Locale;
  return defaultLocale;
}

export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return ui[locale][key] ?? ui[defaultLocale][key];
  };
}

/** Build a site-relative href honoring base path and locale prefix. */
export function localePath(locale: Locale, path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const full = `${base}${prefix}${clean === '/' ? '/' : clean}`;
  return full.replace(/\/{2,}/g, '/');
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'tr' : 'en';
}

/** Translate the current path into the other locale. */
export function switchLocalePath(url: URL, to: Locale): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : url.pathname;
  for (const l of locales) {
    if (path === `/${l}` || path.startsWith(`/${l}/`)) {
      path = path.slice(l.length + 1) || '/';
      break;
    }
  }
  return localePath(to, path);
}
