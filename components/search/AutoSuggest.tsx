"use client";

import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

interface AutoSuggestProps<T> {
  label: string;
  placeholder: string;
  icon: ReactNode;
  display: ReactNode;
  subDisplay?: ReactNode;
  search: (term: string) => T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onSelect: (item: T) => void;
  error?: boolean;
  className?: string;
}

export function AutoSuggest<T>({
  label,
  placeholder,
  icon,
  display,
  subDisplay,
  search,
  getKey,
  renderItem,
  onSelect,
  error,
  className,
}: AutoSuggestProps<T>) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const items = useMemo(() => search(term), [search, term]);

  const close = useCallback(() => {
    setOpen(false);
    setTerm("");
  }, []);
  useClickOutside(wrapRef, close, open);

  const choose = (item: T) => {
    onSelect(item);
    close();
  };

  const openPanel = () => {
    setOpen(true);
    setHighlight(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={openPanel}
        className={cn(
          "flex h-full w-full items-start gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition hover:border-brand-400",
          error ? "border-red-400" : "border-slate-200",
          open && "border-brand-500 ring-4 ring-brand-500/15",
        )}
      >
        <span className="mt-0.5 text-brand-600">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</span>
          <span className="block truncate text-lg font-bold leading-tight">{display}</span>
          {subDisplay && <span className="block truncate text-xs text-ink-500">{subDisplay}</span>}
        </span>
      </button>

      {open && (
        <div className="card absolute left-0 top-[calc(100%+6px)] z-40 w-full min-w-72 overflow-hidden p-2 animate-fade-up sm:w-96">
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setHighlight(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlight((h) => Math.min(h + 1, items.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
              } else if (e.key === "Enter" && items[highlight]) {
                e.preventDefault();
                choose(items[highlight]);
              }
            }}
            placeholder={placeholder}
            className="input mb-2"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
          />
          <ul id={listId} role="listbox" className="max-h-72 overflow-y-auto">
            {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-ink-500">No matches found</li>}
            {items.map((item, i) => (
              <li
                key={getKey(item)}
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => choose(item)}
                className={cn("cursor-pointer rounded-lg px-3 py-2.5 transition", i === highlight ? "bg-brand-50" : "")}
              >
                {renderItem(item)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
