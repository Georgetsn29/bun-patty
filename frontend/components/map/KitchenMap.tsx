'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LOCATIONS } from '@/data/locations';
import styles from './KitchenMap.module.scss';

/**
 * Street map of Tbilisi with exact pins for every kitchen (canvas "Map" component).
 * OpenStreetMap raster tiles, Web Mercator projection, drag to pan, +/− zoom.
 * Tiles: © OpenStreetMap contributors (attribution shown in the corner, as required).
 */

const TILE = 256;
const MIN_Z = 13;
const MAX_Z = 17;

function project(lat: number, lng: number, z: number) {
  const n = TILE * 2 ** z;
  const x = ((lng + 180) / 360) * n;
  const s = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n;
  return { x, y };
}

interface KitchenMapProps {
  /** Selected kitchen id (highlighted, map centres on it) */
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** 'all' fits every kitchen, 'selected' centres on the selected one */
  focus?: 'all' | 'selected';
  initialZoom?: number;
  /** Show +/−/recenter buttons */
  controls?: boolean;
  /** Only show these kitchens (defaults to all) */
  ids?: string[];
  label?: string;
}

export const KitchenMap: React.FC<KitchenMapProps> = ({
  selectedId,
  onSelect,
  focus = 'all',
  initialZoom = 15,
  controls = true,
  ids,
  label = 'Map of our kitchens',
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);

  const kitchens = useMemo(() => LOCATIONS.filter((l) => !ids || ids.includes(l.id)), [ids]);
  const userZoomed = useRef(false);
  const zoomBy = (d: number) => {
    userZoomed.current = true;
    setZoom((z) => Math.min(MAX_Z, Math.max(MIN_Z, z + d)));
  };

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // "Show all" maps zoom to the closest level where every pin fits (until the user zooms)
  useEffect(() => {
    if (focus !== 'all' || userZoomed.current || !size.w || kitchens.length < 2) return;
    const padX = 140;
    const padY = 110;
    let best = MIN_Z;
    for (let z = MAX_Z; z >= MIN_Z; z--) {
      const pts = kitchens.map((k) => project(k.coordinates.lat, k.coordinates.lng, z));
      const w = Math.max(...pts.map((p) => p.x)) - Math.min(...pts.map((p) => p.x));
      const h = Math.max(...pts.map((p) => p.y)) - Math.min(...pts.map((p) => p.y));
      if (w + padX * 2 <= size.w && h + padY * 2 <= size.h) {
        best = z;
        break;
      }
    }
    setZoom(best);
  }, [focus, size.w, size.h, kitchens]);

  // Re-centre when the selection or zoom changes
  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [selectedId, zoom, focus]);

  // World-pixel centre of the view
  const center = useMemo(() => {
    const sel = kitchens.find((k) => k.id === selectedId);
    if (focus === 'selected' && sel) return project(sel.coordinates.lat, sel.coordinates.lng, zoom);
    const pts = kitchens.map((k) => project(k.coordinates.lat, k.coordinates.lng, zoom));
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  }, [kitchens, selectedId, focus, zoom]);

  // Screen offset of world pixel (0,0)
  const ox = size.w / 2 - center.x + pan.x;
  const oy = size.h / 2 - center.y + pan.y;

  const tiles = useMemo(() => {
    if (!size.w || !size.h) return [];
    const x0 = Math.floor(-ox / TILE);
    const y0 = Math.floor(-oy / TILE);
    const x1 = Math.floor((size.w - ox) / TILE);
    const y1 = Math.floor((size.h - oy) / TILE);
    const max = 2 ** zoom;
    const out: { key: string; x: number; y: number; src: string }[] = [];
    for (let tx = x0; tx <= x1; tx++) {
      for (let ty = y0; ty <= y1; ty++) {
        if (ty < 0 || ty >= max) continue;
        const wx = ((tx % max) + max) % max;
        out.push({
          key: `${zoom}-${tx}-${ty}`,
          x: tx * TILE + ox,
          y: ty * TILE + oy,
          src: `https://tile.openstreetmap.org/${zoom}/${wx}/${ty}.png`,
        });
      }
    }
    return out;
  }, [ox, oy, size, zoom]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    setPan({ x: d.px + dx, y: d.py + dy });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div
      ref={boxRef}
      className={styles.map}
      role="region"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className={styles.tiles} aria-hidden="true">
        {tiles.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={t.key}
            src={t.src}
            alt=""
            width={TILE}
            height={TILE}
            draggable={false}
            className={styles.tile}
            style={{ transform: `translate(${t.x}px, ${t.y}px)` }}
          />
        ))}
      </div>

      {size.w > 0 &&
        kitchens.map((k) => {
          const p = project(k.coordinates.lat, k.coordinates.lng, zoom);
          const on = k.id === selectedId;
          const n = LOCATIONS.indexOf(k) + 1;
          return (
            <button
              key={k.id}
              type="button"
              onClick={() => onSelect?.(k.id)}
              className={`${styles.pin} ${on ? styles.pinOn : ''}`}
              style={{ transform: `translate(${p.x + ox}px, ${p.y + oy}px) translate(-50%, -100%)`, zIndex: on ? 3 : 2 }}
              aria-pressed={on}
              aria-label={k.shortName}
            >
              <span className={styles.pinLabel}>
                <span className={styles.pinNum}>0{n}</span>
                {k.shortName.toUpperCase()}
              </span>
              <span className={styles.pinStem} aria-hidden="true" />
            </button>
          );
        })}

      {controls && (
        <div className={styles.controls}>
          <button type="button" onClick={() => zoomBy(1)} aria-label="Zoom in" disabled={zoom >= MAX_Z}>
            +
          </button>
          <button type="button" onClick={() => zoomBy(-1)} aria-label="Zoom out" disabled={zoom <= MIN_Z}>
            −
          </button>
          <button type="button" onClick={() => {
              userZoomed.current = false;
              setPan({ x: 0, y: 0 });
              if (focus !== 'all') setZoom(initialZoom);
              else setSize((v) => ({ ...v }));
            }}
            aria-label="Recenter" className={styles.recenter}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      )}

      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.attribution}
      >
        © OpenStreetMap contributors
      </a>
    </div>
  );
};
