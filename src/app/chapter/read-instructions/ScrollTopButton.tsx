"use client";

import { useEffect, useState } from "react";

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 280);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="回到顶部"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 rounded-full border border-white/40 bg-[#3A2B1F] px-4 py-3 text-xs font-semibold text-[#F8EBD5] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#2B2017] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F8EBD5]/70 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      回到顶部
    </button>
  );
}
