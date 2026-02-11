import Link from "next/link";
import AuthEntry from "@/components/AuthEntry";

const navItems = [

  {
    chinese: "阅读说明",
    english: "Read Instructions",
    href: "/chapter/read-instructions",
  },
  { chinese: "看见自己", english: "See Yourself", href: "/chapter/chapter-1" },
  { chinese: "积极生活", english: "Live Positively", href: "/chapter/chapter-2" },
  { chinese: "清楚交代", english: "State Clearly", href: "/chapter/chapter-3" },
  { chinese: "好好告别", english: "Farewell Gracefully", href: "/chapter/chapter-4" },
];

export default function ChapterTopNav() {
  return (
    <header className="sticky top-0 z-50 bg-[#2B2017]/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 sm:px-4 sm:py-3">
        <Link
          href="/"
          className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          返回主页
        </Link>

        <nav className="flex justify-center">
          <ul className="flex flex-wrap items-center justify-center gap-3 text-center text-[#F8EBD5] sm:gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="group block">
                  <span className="block text-xs font-semibold tracking-widest text-[#F8EBD5] group-hover:text-yellow-200 sm:text-sm">
                    {item.chinese}
                  </span>
                  <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[#F8EBD5]/80 sm:text-[11px]">
                    {item.english}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="justify-self-end">
          <AuthEntry />
        </div>
      </div>
    </header>

  );
}


