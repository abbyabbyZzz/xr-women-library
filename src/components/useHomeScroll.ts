import { useEffect, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';

/** Eased desktop screen changes; touch and oversized content retain native scrolling. */
export default function useHomeScroll(mainRef: RefObject<HTMLElement | null>, reducedMotion: boolean) {
  const navigate = useNavigate();
  useEffect(() => {
    const main = mainRef.current;
    if (!main || reducedMotion) return;
    const root = document.documentElement;
    const panels = [...main.querySelectorAll<HTMLElement>('.home-panel')];
    const finePointer = window.matchMedia('(pointer: fine)');
    let enabled = false;
    let frame = 0;
    let destination = 0;
    let wheelTotal = 0;
    let lastWheel = 0;
    let lastDirection = 0;
    let layoutKey = '';
    let focusWhenDone = false;

    const stops = () => panels.map(panel => Math.min(panel.getBoundingClientRect().top + window.scrollY, root.scrollHeight - window.innerHeight));
    function cancel() {
      cancelAnimationFrame(frame);
      frame = 0;
      wheelTotal = 0;
    }
    function updateMode() {
      const heights = panels.map(panel => panel.getBoundingClientRect().height);
      const nextEnabled = finePointer.matches && heights.every(height => height <= window.innerHeight + 3);
      const nextKey = `${window.innerWidth}:${window.innerHeight}:${heights.map(Math.round).join(':')}`;
      if (nextKey === layoutKey && nextEnabled === enabled) return;
      const changedLayout = layoutKey !== '';
      const wasAnimating = frame !== 0;
      const pendingFocus = focusWhenDone;
      layoutKey = nextKey;
      enabled = nextEnabled;
      root.classList.toggle('home-scroll-enhanced', enabled);
      if (!enabled) cancel();
      else if (wasAnimating) animateTo(destination, pendingFocus);
      else if (changedLayout) {
        const positions = stops();
        const closest = positions.reduce((best, top, index) => Math.abs(top - window.scrollY) < Math.abs(positions[best] - window.scrollY) ? index : best, 0);
        window.scrollTo({ top: positions[closest], behavior: 'instant' });
      }
    }
    function animateTo(index: number, focus = false) {
      cancel();
      const start = window.scrollY;
      const target = stops()[index];
      destination = index;
      focusWhenDone = focus;
      const distance = target - start;
      const duration = Math.max(420, Math.min(860, Math.abs(distance) * .7 + 200));
      const began = performance.now();
      function move(now: number) {
        const progress = Math.min(1, (now - began) / duration);
        const eased = progress * progress * (3 - 2 * progress);
        window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
        if (progress < 1) frame = requestAnimationFrame(move);
        else {
          frame = 0;
          if (focus) panels[index].focus({ preventScroll: true });
        }
      }
      frame = requestAnimationFrame(move);
    }
    function nextStop(direction: number) {
      const positions = stops();
      if (direction > 0) return positions.findIndex(top => top > window.scrollY + 4);
      for (let index = positions.length - 1; index >= 0; index--) if (positions[index] < window.scrollY - 4) return index;
      return -1;
    }
    function isEditable(target: EventTarget | null) {
      return target instanceof Element && !!target.closest('input, textarea, select, [contenteditable="true"], [role="slider"]');
    }
    function onWheel(event: WheelEvent) {
      const ownScroll = event.target instanceof Element && event.target.closest('textarea, select, input[type="number"], input[type="range"], [contenteditable="true"]');
      if (!enabled || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || ownScroll) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      if (!delta) return;
      const direction = Math.sign(delta);
      const now = performance.now();
      if (now - lastWheel > 180 || direction !== lastDirection) wheelTotal = 0;
      lastDirection = direction;
      lastWheel = now;
      wheelTotal += delta;
      if (frame) {
        event.preventDefault();
        const reverse = Math.sign(stops()[destination] - window.scrollY) !== direction;
        if (reverse && Math.abs(wheelTotal) > 80) {
          const index = nextStop(direction);
          if (index >= 0) animateTo(index);
        }
        return;
      }
      const index = nextStop(direction);
      if (index < 0) return;
      event.preventDefault();
      if (Math.abs(wheelTotal) >= 32) animateTo(index);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { cancel(); return; }
      if (!enabled || event.defaultPrevented || event.altKey || event.metaKey || isEditable(event.target)) return;
      if (event.key === ' ' && event.target instanceof Element && event.target.closest('a, button')) return;
      let index = -1;
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = panels.length - 1;
      else if (event.key === 'PageDown' || event.key === ' ') index = nextStop(event.shiftKey ? -1 : 1);
      else if (event.key === 'PageUp') index = nextStop(-1);
      else return;
      if (index < 0) return;
      event.preventDefault();
      animateTo(index, true);
    }
    function onAnchor(event: MouseEvent) {
      if (!enabled || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a.home-scroll-link') : null;
      const index = panels.findIndex(panel => `#${panel.id}` === link?.hash);
      if (!link || index < 0) return;
      event.preventDefault();
      if (location.hash !== link.hash) void navigate({ hash: link.hash });
      animateTo(index, true);
    }
    const resizeObserver = new ResizeObserver(updateMode);
    panels.forEach(panel => resizeObserver.observe(panel));
    updateMode();
    main.addEventListener('click', onAnchor);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', cancel, { passive: true });
    window.addEventListener('popstate', cancel);
    window.addEventListener('resize', updateMode);
    finePointer.addEventListener('change', updateMode);
    return () => {
      cancel();
      root.classList.remove('home-scroll-enhanced');
      resizeObserver.disconnect();
      main.removeEventListener('click', onAnchor);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', cancel);
      window.removeEventListener('popstate', cancel);
      window.removeEventListener('resize', updateMode);
      finePointer.removeEventListener('change', updateMode);
    };
  }, [mainRef, reducedMotion, navigate]);
}
