import type Lenis from 'lenis';

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

/** Scroll to an element, using Lenis when available and native scrolling otherwise. */
export function scrollToElement(target: Element, offset = -24) {
  if (instance) instance.scrollTo(target as HTMLElement, { offset });
  else target.scrollIntoView({ behavior: 'smooth' });
}
