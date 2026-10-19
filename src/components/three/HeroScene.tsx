import { lazy, Suspense, useEffect, useState } from 'react';

const GlassScene = lazy(() => import('./GlassScene'));

const READY_CLASS = 'hero-ready';
const NO_WEBGL_CLASS = 'no-webgl';

function supportsWebGL() {
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
}

/** Defers the heavy 3D bundle until the page has painted, then swaps the placeholder out on the first rendered frame. */
export default function HeroScene() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !supportsWebGL()) {
      document.documentElement.classList.add(NO_WEBGL_CLASS);
      return;
    }

    const mq = window.matchMedia('(max-width: 767px)');
    const updateMobile = () => setMobile(mq.matches);
    updateMobile();
    mq.addEventListener('change', updateMobile);

    const start = () => setShouldLoad(true);
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const handle = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 200);
    const cancel = (id: number) => (hasIdle ? window.cancelIdleCallback(id) : window.clearTimeout(id));

    return () => {
      mq.removeEventListener('change', updateMobile);
      cancel(handle);
      document.documentElement.classList.remove(READY_CLASS);
    };
  }, []);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <GlassScene mobile={mobile} onReady={() => document.documentElement.classList.add(READY_CLASS)} />
    </Suspense>
  );
}
