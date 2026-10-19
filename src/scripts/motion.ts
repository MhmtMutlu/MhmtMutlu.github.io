import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setLenis, scrollToElement } from '../lib/scroll';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initSmoothScroll() {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  setLenis(lenis);

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const hash = anchor.getAttribute('href') ?? '';
      const target = hash.length > 1 ? document.querySelector(hash) : null;
      if (!target) return;
      event.preventDefault();
      scrollToElement(target);
      history.replaceState(null, '', hash);
    });
  });
}

function initReveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay: Number(el.dataset.revealDelay ?? 0),
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
    gsap.fromTo(
      group.querySelectorAll<HTMLElement>('[data-stagger-item]'),
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: 'expo.out',
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      },
    );
  });
}

function initActiveSection() {
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-dock-link]');
  const sections = Array.from(links)
    .map((link) => document.querySelector<HTMLElement>(link.getAttribute('href') ?? ''))
    .filter((el): el is HTMLElement => el !== null);
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.toggleAttribute('data-active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  sections.forEach((section) => observer.observe(section));
}

function setup() {
  document.documentElement.classList.remove('no-js');
  if (prefersReducedMotion()) {
    document.documentElement.classList.add('reduced-motion');
    return;
  }
  initSmoothScroll();
  initReveals();
  initActiveSection();
}

function teardown() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  if (tick) gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null;
  tick = null;
  setLenis(null);
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', teardown);
