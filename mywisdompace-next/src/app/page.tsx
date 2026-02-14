import NavBar from "@/components/NavBar";
import HomeChapterNav from "@/components/HomeChapterNav";

export default function Home() {
  return (
    <div className="relative h-screen w-screen">
      <NavBar />
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-75"
        style={{ backgroundImage: "url(/images/hero-background.webp)" }}
      />

      {/* Overlay to darken the image slightly for better text contrast */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 h-full px-4 text-white">
        <div className="absolute top-1/2 left-1/2 w-[min(92vw,56rem)] -translate-x-1/2 -translate-y-1/2 text-center sm:left-[62%] sm:w-[min(56rem,62vw)]">
          <div className="flex flex-col items-center">
            <h1 className="font-cn-serif text-shadow-lg text-6xl font-bold tracking-[0.14em] leading-none text-white sm:text-7xl md:text-8xl">
              一生的整理
            </h1>
            <p className="text-shadow mt-5 inline-block whitespace-nowrap text-lg font-semibold tracking-wider text-white/95 sm:-ml-[0.14em] sm:text-[1.47rem] md:text-[1.63rem]">
              Wisdompace | A lifelong practice of living
            </p>

            <div className="mt-8 w-full max-w-[520px] sm:max-w-[560px]">
              <form className="flex items-center gap-3 rounded-full bg-white/68 px-4 py-2 shadow-[0_18px_45px_rgba(15,23,42,0.22)] ring-1 ring-white/60 backdrop-blur-sm">
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
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="全站搜索 性格测评、优势探索、痴呆预防..."
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-500 focus:outline-none sm:text-base"
                />
                <button
                  type="button"
                  className="rounded-full bg-[#C9A15A]/85 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(201,161,90,0.28)] transition hover:bg-[#B58A3A]/85"
                >
                  搜索
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/90">
                <span className="mr-1">🔥 热门搜索：</span>
                {[
                  "老年痴呆",
                  "人生意义",
                  "生前预嘱",
                  "新式养老",
                  "老龄化",
                  "兴趣探索",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[0.7rem] font-medium text-white/90 backdrop-blur-sm transition hover:border-white/70 hover:bg-white/20"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <HomeChapterNav />
    </div>
  );
}
