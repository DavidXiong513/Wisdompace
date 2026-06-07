"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import { searchAll, type SearchHit } from "@/lib/search-index";

function SearchContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query) {
      setIsSearching(true);
      try {
        const hits = searchAll(query, i18n.language || "zh-CN");
        setResults(hits);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setResults([]);
    }
  }, [query, i18n.language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <NavBar />
      
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-12 sm:px-6">
        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-3 shadow-lg ring-1 ring-slate-200 backdrop-blur-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/70 text-slate-500">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="flex-1 bg-transparent text-base text-slate-700 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-[#C9A15A]/85 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#B58A3A]/85"
            >
              {t("search.button")}
            </button>
          </div>
        </form>

        {/* 搜索结果 */}
        {query && (
          <div>
            <div className="mb-6 text-sm" style={{ color: "var(--wp-ink-muted)" }}>
              {isSearching ? (
                t("tool.loadError") === "Tool failed to load. Please refresh the page." ? "Searching..." : "搜索中..."
              ) : results.length > 0 ? (
                <>
                  {t("nav.logout") === "Logout" ? "Found " : "找到 "}
                  <strong className="font-semibold" style={{ color: "var(--wp-ink)" }}>{results.length}</strong> 
                  {t("nav.logout") === "Logout" ? " results" : " 条结果"}
                </>
              ) : (
                <>
                  {t("nav.logout") === "Logout" ? "No results found for " : "未找到与 "}&quot;<strong>{query}</strong>&quot;{t("nav.logout") === "Logout" ? "" : " 相关的内容"}
                </>
              )}
            </div>

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((hit, index) => (
                  <Link
                    key={`${hit.href}-${index}`}
                    href={hit.href}
                    className="block rounded-xl p-5 transition"
                    style={{
                      background: "var(--wp-card-bg)",
                      border: "1px solid var(--wp-border)",
                    }}
                  >
                    <h3 
                      className="mb-2 text-lg font-semibold"
                      style={{ color: "var(--wp-accent)" }}
                    >
                      {hit.title}
                    </h3>
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--wp-ink-muted)" }}
                    >
                      ...{hit.excerpt}...
                    </p>
                  </Link>
                ))}
              </div>
            ) : query && !isSearching && (
              <div className="text-center py-12">
                <p className="text-base" style={{ color: "var(--wp-ink-muted)" }}>
                  {t("search.noResults")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 空状态 */}
        {!query && (
          <div className="text-center py-12">
            <p className="text-base" style={{ color: "var(--wp-ink-muted)" }}>
              {t("nav.logout") === "Logout" ? "Enter a keyword to start searching" : "请输入关键词开始搜索"}
            </p>
          </div>
        )}
      </main>
    </>
  );
}

export default function SearchPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen" style={{ background: "var(--wp-bg)" }}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>{t("tool.loadError") === "Tool failed to load. Please refresh the page." ? "Loading..." : "加载中..."}</p>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
