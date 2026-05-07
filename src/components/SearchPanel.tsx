"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { searchAll } from "@/lib/search-index";
import { validateSearchQuery } from "@/lib/security";

export function SearchPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
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

  // 安全处理: 验证并清洗搜索查询
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // 限制输入长度
    if (rawValue.length > 100) {
      setError("搜索内容不能超过100个字符");
      return;
    }
    
    setError(null);
    setQuery(rawValue);
  };

  // 安全处理: 使用验证后的查询进行搜索
  const results = useMemo(() => {
    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      return [];
    }
    return searchAll(validation.sanitized);
  }, [query]);

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
            onChange={handleQueryChange}
            placeholder="检索全站（占位实现：基于本地数据）"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            maxLength={100}
            autoComplete="off"
            spellCheck="false"
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
          {error ? (
            <div className="px-3 py-10 text-center text-sm text-red-500">
              {error}
            </div>
          ) : query.trim() && results.length === 0 ? (
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
              {/* 安全处理: 确保React默认转义生效，标题和摘要已经是安全的 */}
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
