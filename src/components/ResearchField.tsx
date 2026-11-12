import { useEffect, useRef, useState } from 'react';

export function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  return reduced;
}

const SOURCE_RECTS = [[0, .06, .47, .4], [.53, .06, .47, .4], [0, .55, .47, .4], [.53, .55, .47, .4]];
const READING_SELECTORS = '.site-header nav, .home-copy';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (start: number, end: number, value: number) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};
const hash = (a: number, b: number) => {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
};
const poseMix = (time: number, on: number, off: number) => smooth(on, on + 1.6, time) * (1 - smooth(off, off + 1.6, time));

/** Photo-sampled LED halftone from the user's hand reference, not a research graph. */
export default function ResearchField({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phase = useRef(0);
  const pausedRef = useRef(paused);
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    refreshRef.current?.();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const host = canvas.parentElement!;
    const fields = [document.createElement('canvas'), document.createElement('canvas')];
    const fieldContexts = fields.map(field => field.getContext('2d', { willReadFrequently: true })!);
    const source = new Image();
    source.decoding = 'async';
    const tiles: HTMLCanvasElement[] = [];
    const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    const levels = [.26, .52, .78, 1];
    let width = 1;
    let height = 1;
    let step = 7;
    let rowStep = 14;
    let columns = 1;
    let rows = 1;
    let seeds = new Float32Array(0);
    let quiet = new Float32Array(0);
    let color = '#49375f';
    let frame = 0;
    let scrolling = false;
    let scrollTimer = 0;
    let lastFrame = 0;
    let visible = true;
    let readingDirty = true;
    let disposed = false;

    function drawField(pose: number, time: number) {
      const field = fieldContexts[pose];
      field.setTransform(1, 0, 0, 1, 0, 0);
      field.globalCompositeOperation = 'source-over';
      field.fillStyle = '#fff';
      field.fillRect(0, 0, columns, rows);
      field.globalCompositeOperation = 'multiply';
      const angle = Math.PI * 2 * time / 20;
      const handWidth = width * (height > width ? .66 : .53);
      const handHeight = handWidth * tiles[0].height / tiles[0].width;
      const centerY = height * (height > width ? .66 : .64);
      for (let hand = 0; hand < 2; hand++) {
        const ph = hand * Math.PI;
        const reach = (.035 * Math.sin(angle + ph) + .012 * Math.sin(2 * angle + 1.3 + ph)) * width;
        const x = hand === 0 ? reach - width * .045 : width - handWidth + width * .045 - reach;
        const pivot = hand === 0 ? 0 : width;
        const scale = 1 + .07 * Math.sin(angle + .9 + ph);
        field.save();
        field.scale(columns / width, rows / height);
        field.translate(pivot, centerY);
        field.rotate((hand === 0 ? 1 : -1) * .045 * Math.sin(angle + 2.1 + ph));
        field.scale(scale, scale);
        field.translate(-pivot, -centerY);
        field.drawImage(tiles[pose * 2 + hand], x, centerY - handHeight / 2, handWidth, handHeight);
        field.restore();
      }
      return field.getImageData(0, 0, columns, rows).data;
    }

    function paint() {
      if (!context || tiles.length !== 4) return;
      if (readingDirty) updateQuietAreas();
      const time = phase.current % 20;
      const a = drawField(0, time);
      const b = drawField(1, time);
      const mixes = [poseMix(time, 6.2, 14.6), poseMix(time, 2.4, 10.4)];
      const tick = Math.floor(time * 7);
      const radius = step * .48;
      for (let level = 0; level < 4; level++) paths[level] = new Path2D();
      context.clearRect(0, 0, width, height);
      for (let row = 0; row < rows; row++) {
        const shift = hash(row, tick) > .99 ? Math.round((hash(tick, row) - .5) * 6) : 0;
        for (let column = 0; column < columns; column++) {
          const index = row * columns + column;
          if (quiet[index] < .01) continue;
          const sampleColumn = Math.max(0, Math.min(columns - 1, column - shift));
          const sampleIndex = row * columns + sampleColumn;
          const seed = seeds[index];
          const mix = mixes[column < columns / 2 ? 0 : 1];
          const pixel = seed < mix ? b : a;
          let value = clamp((1 - pixel[sampleIndex * 4] / 255 - .08) / .45);
          if (!value) continue;
          if (mix > .001 && mix < .999) {
            const edge = Math.abs(seed - mix);
            if (edge < .08) value *= edge / .08 * (hash(column + tick, row) <= .4 ? .5 : 1);
          }
          value *= (.86 + .14 * Math.sin(time * 3.2 + seed * 40)) * quiet[index];
          value *= smooth(.025, .08, Math.abs((column + .5) / columns - .5));
          const level = value >= .87 ? 3 : value >= .65 ? 2 : value >= .39 ? 1 : value >= .13 ? 0 : -1;
          if (level < 0) continue;
          const r = radius * (level === 0 ? .45 : levels[level]);
          const x = (column + .5) * step;
          const y = (row + .5) * rowStep;
          paths[level].moveTo(x + r, y);
          paths[level].arc(x, y, r, 0, Math.PI * 2);
        }
      }
      context.fillStyle = color;
      context.globalAlpha = .84;
      for (const path of paths) context.fill(path);
      context.globalAlpha = 1;
    }

    function tick(timestamp: number) {
      if (scrolling || !visible || document.hidden || pausedRef.current) return;
      // Leave scrolling frames to the screen transition; cap dense artwork at 30fps.
      if (!lastFrame || timestamp - lastFrame >= 32) {
        if (lastFrame) phase.current += Math.min((timestamp - lastFrame) / 1000, .08);
        lastFrame = timestamp;
        paint();
      }
      frame = requestAnimationFrame(tick);
    }
    function restart() {
      cancelAnimationFrame(frame);
      lastFrame = 0;
      paint();
      if (!scrolling && !pausedRef.current && visible && !document.hidden && tiles.length === 4) frame = requestAnimationFrame(tick);
    }
    function updateQuietAreas() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      quiet.fill(1);
      const areas = [...(host.closest('.app-shell') || host).querySelectorAll<HTMLElement>(READING_SELECTORS)]
        .filter(element => element.getBoundingClientRect().height > 0)
        .map(element => {
          const area = element.getBoundingClientRect();
          return { left: area.left - rect.left - 6, right: area.right - rect.left + 6, top: area.top - rect.top - 6, bottom: area.bottom - rect.top + 6 };
        });
      for (const area of areas) {
        const startColumn = Math.max(0, Math.floor((area.left - 24) / step));
        const endColumn = Math.min(columns - 1, Math.ceil((area.right + 24) / step));
        const startRow = Math.max(0, Math.floor((area.top - 24) / rowStep));
        const endRow = Math.min(rows - 1, Math.ceil((area.bottom + 24) / rowStep));
        for (let row = startRow; row <= endRow; row++) for (let column = startColumn; column <= endColumn; column++) {
          const index = row * columns + column;
          const x = (column + .5) * step;
          const y = (row + .5) * rowStep;
          const dx = Math.max(area.left - x, 0, x - area.right);
          const dy = Math.max(area.top - y, 0, y - area.bottom);
          quiet[index] = Math.min(quiet[index], smooth(0, 24, Math.hypot(dx, dy)));
        }
      }
      readingDirty = false;
    }
    function resize() {
      if (!canvas || !context) return;
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      step = Math.max(width < 768 ? 2.4 : 3.2, width / 340);
      rowStep = step * 1.4;
      columns = Math.ceil(width / step);
      rows = Math.ceil(height / rowStep);
      seeds = new Float32Array(columns * rows);
      quiet = new Float32Array(columns * rows);
      for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
        seeds[row * columns + column] = .55 * hash(column, row) + .45 * hash(row * 3.1, 7.7);
      }
      readingDirty = true;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      fields.forEach(field => { field.width = columns; field.height = rows; });
      color = getComputedStyle(host).getPropertyValue('--color-primary-hover').trim() || '#49375f';
      restart();
    }
    function readingMoved() {
      readingDirty = true;
      scrolling = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => { scrolling = false; restart(); }, 140);
    }

    source.onload = () => {
      if (disposed) return;
      for (const [x, y, w, h] of SOURCE_RECTS) {
        const tile = document.createElement('canvas');
        tile.width = 420;
        tile.height = Math.round(420 * source.naturalHeight * h / (source.naturalWidth * w));
        const tileContext = tile.getContext('2d')!;
        tileContext.imageSmoothingQuality = 'high';
        tileContext.drawImage(source, source.naturalWidth * x, source.naturalHeight * y, source.naturalWidth * w, source.naturalHeight * h, 0, 0, tile.width, tile.height);
        tiles.push(tile);
      }
      restart();
    };
    source.src = `${import.meta.env.BASE_URL}images/hands-source.webp`;
    const resizeObserver = new ResizeObserver(resize);
    const contentObserver = new MutationObserver(() => {
      (host.closest('.app-shell') || host).querySelectorAll<HTMLElement>(READING_SELECTORS).forEach(element => resizeObserver.observe(element));
      resize();
    });
    const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; restart(); }, { threshold: .01 });
    resizeObserver.observe(canvas);
    contentObserver.observe(host.closest('main') || host, { childList: true, subtree: true });
    (host.closest('.app-shell') || host).querySelectorAll<HTMLElement>(READING_SELECTORS).forEach(element => resizeObserver.observe(element));
    visibilityObserver.observe(canvas);
    window.addEventListener('scroll', readingMoved, { passive: true });
    document.addEventListener('visibilitychange', restart);
    refreshRef.current = () => { readingDirty = true; restart(); };
    resize();
    return () => {
      disposed = true;
      refreshRef.current = null;
      source.onload = null;
      cancelAnimationFrame(frame);
      window.clearTimeout(scrollTimer);
      resizeObserver.disconnect();
      contentObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('scroll', readingMoved);
      document.removeEventListener('visibilitychange', restart);
    };
  }, []);

  return <canvas className="research-field-canvas" data-artwork="dot-matrix-hands" ref={canvasRef} aria-hidden="true" />;
}
