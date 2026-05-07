'use client';

export function ScrollToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="text-xs font-semibold text-[#C9A15A] hover:underline"
    >
      回到顶部 ↑
    </button>
  );
}
