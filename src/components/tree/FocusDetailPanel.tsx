"use client";

import clsx from "clsx";
import type { FocusDTO, PathDTO } from "@/types/focus";
import { STATUS_META } from "./statusStyles";

export function FocusDetailPanel({
  focus,
  path,
  allFocuses,
  onClose,
  onSelectFocus
}: {
  focus: FocusDTO;
  path: PathDTO | null;
  allFocuses: Map<string, FocusDTO>;
  onClose: () => void;
  onSelectFocus: (id: string) => void;
}) {
  const meta = STATUS_META[focus.status];
  const prerequisites = focus.incoming.map((id) => allFocuses.get(id)).filter(Boolean) as FocusDTO[];

  return (
    <div className="absolute inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-cedar-950/95 p-6 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={clsx("flex h-12 w-12 items-center justify-center rounded-lg text-lg", meta.fill)}>
              {focus.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={focus.iconUrl} alt="" className="h-9 w-9 rounded object-cover" />
              ) : (
                <span className={meta.text}>★</span>
              )}
            </span>
            <div>
              <h3 className="font-display text-lg leading-tight text-ink-100">{focus.title}</h3>
              {path && (
                <p className="text-xs" style={{ color: path.color }}>
                  {path.name}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-100" aria-label="Close">
            ✕
          </button>
        </div>

        <span className={clsx("mb-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs", meta.fill, meta.text)}>
          <span className={clsx("h-1.5 w-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </span>

        {focus.description && <p className="mb-5 text-sm leading-relaxed text-ink-300">{focus.description}</p>}

        {focus.requirements.length > 0 && (
          <div className="mb-5">
            <h4 className="mb-2 text-xs uppercase tracking-wide text-ink-500">Requirements</h4>
            <ul className="space-y-1 text-sm text-ink-100">
              {focus.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-500" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {prerequisites.length > 0 && (
          <div className="mb-5">
            <h4 className="mb-2 text-xs uppercase tracking-wide text-ink-500">Prerequisite focuses</h4>
            <ul className="space-y-1">
              {prerequisites.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onSelectFocus(p.id)}
                    className="text-sm text-gold-light hover:underline"
                  >
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {focus.status === "COMPLETE" && focus.completionText && (
          <div className="rounded-md border border-status-complete/30 bg-status-complete/10 p-3 text-sm text-ink-100">
            {focus.completionText}
          </div>
        )}
      </div>
    </div>
  );
}
