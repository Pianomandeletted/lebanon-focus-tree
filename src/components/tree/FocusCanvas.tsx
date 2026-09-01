"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import clsx from "clsx";
import type { FocusDTO, PathDTO, TreeData } from "@/types/focus";
import { STATUS_META } from "./statusStyles";
import { FocusDetailPanel } from "./FocusDetailPanel";

const NODE_W = 190;
const NODE_H = 78;
const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;

type Camera = { x: number; y: number; scale: number };

export function FocusCanvas() {
  const [data, setData] = useState<TreeData | null>(null);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 0.6 });
  const [selectedFocusId, setSelectedFocusId] = useState<string | null>(null);
  const [activePathIds, setActivePathIds] = useState<Set<string> | null>(null); // null = all
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ dragging: boolean; lastX: number; lastY: number }>({
    dragging: false,
    lastX: 0,
    lastY: 0
  });
  const pinchState = useRef<Map<number, { x: number; y: number }>>(new Map());

  useEffect(() => {
    fetch("/api/focuses")
      .then((r) => r.json())
      .then((json: TreeData) => setData(json))
      .catch(() => setData({ paths: [], focuses: [] }));
  }, []);

  const focusById = useMemo(() => {
    const map = new Map<string, FocusDTO>();
    data?.focuses.forEach((f) => map.set(f.id, f));
    return map;
  }, [data]);

  const pathById = useMemo(() => {
    const map = new Map<string, PathDTO>();
    data?.paths.forEach((p) => map.set(p.id, p));
    return map;
  }, [data]);

  const visibleFocuses = useMemo(() => {
    if (!data) return [];
    return data.focuses.filter((f) => {
      if (activePathIds && !activePathIds.has(f.pathId)) return false;
      if (search.trim() && !f.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [data, activePathIds, search]);

  const visibleIds = useMemo(() => new Set(visibleFocuses.map((f) => f.id)), [visibleFocuses]);

  function clampScale(s: number) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
  }

  const zoomAt = useCallback((clientX: number, clientY: number, factor: number) => {
    setCamera((cam) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return cam;
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;
      const newScale = clampScale(cam.scale * factor);
      const worldX = (cx - cam.x) / cam.scale;
      const worldY = (cy - cam.y) / cam.scale;
      return { scale: newScale, x: cx - worldX * newScale, y: cy - worldY * newScale };
    });
  }, []);

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    zoomAt(e.clientX, e.clientY, factor);
  }

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("[data-focus-node]")) return;
    pinchState.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinchState.current.size === 1) {
      dragState.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pinchState.current.has(e.pointerId)) return;
    pinchState.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinchState.current.size === 2) {
      const [a, b] = Array.from(pinchState.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const prevDist = (e.currentTarget as any)._prevPinchDist ?? dist;
      const factor = dist / prevDist;
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      zoomAt(midX, midY, factor);
      (e.currentTarget as any)._prevPinchDist = dist;
      return;
    }

    if (dragState.current.dragging) {
      const dx = e.clientX - dragState.current.lastX;
      const dy = e.clientY - dragState.current.lastY;
      dragState.current.lastX = e.clientX;
      dragState.current.lastY = e.clientY;
      setCamera((cam) => ({ ...cam, x: cam.x + dx, y: cam.y + dy }));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pinchState.current.delete(e.pointerId);
    if (pinchState.current.size === 0) dragState.current.dragging = false;
  }

  function resetView() {
    setCamera({ x: 120, y: 80, scale: 0.55 });
  }

  useEffect(() => {
    resetView();
  }, []);

  const selectedFocus = selectedFocusId ? focusById.get(selectedFocusId) ?? null : null;

  return (
    <div className="relative h-[calc(100vh-57px)] w-full overflow-hidden">
      {/* Sidebar: legend / path filters / search */}
      <aside
        className={clsx(
          "absolute left-0 top-0 z-30 h-full w-72 shrink-0 overflow-y-auto border-r border-white/5 bg-cedar-950/85 p-4 backdrop-blur-md transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base text-ink-100">Paths</h2>
          <button onClick={() => setSidebarOpen(false)} className="text-xs text-ink-500 hover:text-ink-100">
            Hide
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search focuses..."
          className="mb-4 w-full rounded-md border border-white/10 bg-cedar-900 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold focus:outline-none"
        />

        <button
          onClick={() => setActivePathIds(null)}
          className={clsx(
            "mb-2 w-full rounded-md px-2 py-1.5 text-left text-xs",
            activePathIds === null ? "bg-cedar-800 text-gold-light" : "text-ink-300 hover:bg-cedar-800/60"
          )}
        >
          All paths
        </button>

        <ul className="space-y-1">
          {data?.paths.map((p) => {
            const on = activePathIds === null || activePathIds.has(p.id);
            return (
              <li key={p.id}>
                <button
                  onClick={() =>
                    setActivePathIds((prev) => {
                      const next = new Set(prev ?? data.paths.map((x) => x.id));
                      if (next.has(p.id)) next.delete(p.id);
                      else next.add(p.id);
                      return next;
                    })
                  }
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition",
                    on ? "text-ink-100" : "text-ink-500 opacity-50"
                  )}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="truncate">{p.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute left-3 top-3 z-30 rounded-md border border-white/10 bg-cedar-900/90 px-3 py-1.5 text-xs text-ink-100 backdrop-blur-md"
        >
          Show paths
        </button>
      )}

      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-30 flex flex-col gap-1">
        <button
          onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1.2)}
          className="h-9 w-9 rounded-md border border-white/10 bg-cedar-900/90 text-ink-100 backdrop-blur-md"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 0.8)}
          className="h-9 w-9 rounded-md border border-white/10 bg-cedar-900/90 text-ink-100 backdrop-blur-md"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="h-9 w-9 rounded-md border border-white/10 bg-cedar-900/90 text-[10px] text-ink-100 backdrop-blur-md"
          aria-label="Reset view"
        >
          RST
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="focus-canvas-grid h-full w-full touch-none"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="relative origin-top-left"
          style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})` }}
        >
          <svg className="pointer-events-none absolute left-0 top-0 overflow-visible">
            {visibleFocuses.map((f) =>
              f.incoming
                .filter((fromId) => visibleIds.has(fromId))
                .map((fromId) => {
                  const from = focusById.get(fromId);
                  if (!from) return null;
                  const path = pathById.get(f.pathId);
                  const x1 = from.x + NODE_W / 2;
                  const y1 = from.y + NODE_H;
                  const x2 = f.x + NODE_W / 2;
                  const y2 = f.y;
                  const midY = (y1 + y2) / 2;
                  return (
                    <path
                      key={`${fromId}-${f.id}`}
                      d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                      stroke={path?.color ?? "#3E5872"}
                      strokeWidth={2}
                      fill="none"
                      opacity={0.55}
                    />
                  );
                })
            )}
          </svg>

          {visibleFocuses.map((f) => {
            const meta = STATUS_META[f.status];
            const path = pathById.get(f.pathId);
            return (
              <button
                key={f.id}
                data-focus-node
                onClick={() => setSelectedFocusId(f.id)}
                style={{ left: f.x, top: f.y, width: NODE_W, borderColor: path?.color }}
                className={clsx(
                  "absolute flex items-center gap-2 rounded-lg border-l-4 bg-cedar-900/90 px-3 py-2.5 text-left shadow-node transition hover:brightness-125",
                  meta.ring
                )}
              >
                <span className={clsx("flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm", meta.fill)}>
                  {f.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.iconUrl} alt="" className="h-7 w-7 rounded object-cover" />
                  ) : (
                    <span className={meta.text}>★</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink-100">{f.title}</span>
                  <span className={clsx("flex items-center gap-1 text-[11px]", meta.text)}>
                    <span className={clsx("h-1.5 w-1.5 rounded-full", meta.dot)} />
                    {meta.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedFocus && (
        <FocusDetailPanel
          focus={selectedFocus}
          path={pathById.get(selectedFocus.pathId) ?? null}
          allFocuses={focusById}
          onClose={() => setSelectedFocusId(null)}
          onSelectFocus={(id) => setSelectedFocusId(id)}
        />
      )}
    </div>
  );
}
