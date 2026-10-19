import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { getTheme, setTheme, type Theme } from '../../lib/theme';
import { scrollToElement } from '../../lib/scroll';

export interface CmdProject { title: string; href: string }
export interface CmdProps {
  labels: Record<
    'placeholder' | 'empty' | 'navigate' | 'projects' | 'actions' | 'social' | 'light' | 'dark' | 'lang' | 'copyEmail' | 'copied',
    string
  >;
  nav: { label: string; href: string }[];
  projects: CmdProject[];
  langHref: string;
  email: string;
  social: { label: string; href: string }[];
}

export default function CommandPalette({ labels, nav, projects, langHref, email, social }: CmdProps) {
  const [open, setOpen] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setThemeState(getTheme());
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    const onTheme = (e: Event) => setThemeState((e as CustomEvent<Theme>).detail);
    window.addEventListener('keydown', onKey);
    window.addEventListener('cmd:open', onOpen);
    window.addEventListener('themechange', onTheme);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('cmd:open', onOpen);
      window.removeEventListener('themechange', onTheme);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) scrollToElement(el);
    } else if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener');
    } else {
      window.location.href = href;
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 900);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      overlayClassName="cmd-overlay"
      contentClassName="cmd-content glass glass-strong glass-sheen"
      loop
    >
      <Command.Input placeholder={labels.placeholder} className="cmd-input" autoFocus />
      <Command.List className="cmd-list">
        <Command.Empty className="cmd-empty">{labels.empty}</Command.Empty>
        <Command.Group heading={labels.navigate}>
          {nav.map((n) => (
            <Command.Item key={n.href} value={n.label} onSelect={() => go(n.href)}>
              <span aria-hidden>→</span> {n.label}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading={labels.projects}>
          {projects.map((p) => (
            <Command.Item key={p.href} value={p.title} onSelect={() => go(p.href)}>
              <span aria-hidden>◆</span> {p.title}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading={labels.actions}>
          <Command.Item
            value={theme === 'dark' ? labels.light : labels.dark}
            onSelect={() => {
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
          >
            <span aria-hidden>{theme === 'dark' ? '☀' : '☾'}</span> {theme === 'dark' ? labels.light : labels.dark}
          </Command.Item>
          <Command.Item value={labels.lang} onSelect={() => go(langHref)}>
            <span aria-hidden>Aa</span> {labels.lang}
          </Command.Item>
          <Command.Item value={labels.copyEmail} onSelect={copyEmail}>
            <span aria-hidden>@</span> {copied ? labels.copied : labels.copyEmail}
          </Command.Item>
        </Command.Group>
        <Command.Group heading={labels.social}>
          {social.map((s) => (
            <Command.Item key={s.href} value={s.label} onSelect={() => go(s.href)}>
              <span aria-hidden>↗</span> {s.label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
      <div className="cmd-footer">
        <kbd>↑↓</kbd> <kbd>↵</kbd> <kbd>esc</kbd>
      </div>
    </Command.Dialog>
  );
}
