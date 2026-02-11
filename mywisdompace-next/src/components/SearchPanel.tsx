"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { searchAll } from "@/lib/search-index";

export function SearchPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const results = useMemo(() => searchAll(query), [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 py-16 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-[var(--shadow-float)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="检索全站（占位实现：基于本地数据）"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
          <button
            className="rounded-full px-3 py-1.5 text-sm text-muted hover:bg-black/5"
            onClick={onClose}
            type="button"
          >
            关闭
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto p-2">
          {query.trim() && results.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm text-muted">
              没有找到结果
            </div>
          ) : null}

          {results.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              onClick={onClose}
              className="block rounded-xl px-3 py-3 transition hover:bg-black/5"
            >
              <div className="text-sm font-medium text-foreground">{r.title}</div>
              <div className="mt-1 text-xs text-muted">{r.excerpt}</div>
            </Link>
          ))}

          {!query.trim() ? (
            <div className="px-3 py-10 text-center text-sm text-muted">
              输入关键词开始检索
            </div>
          ) : null}
        </div>
      </div>

      <button
        className="absolute inset-0 -z-10"
        aria-label="关闭搜索面板"
        onClick={onClose}
        type="button"
      />
    </div>
  );
}
