import React from "react";
import Link from "next/link";

const navItems = [
  { chinese: "阅读说明", english: "Read Instructions", href: "/chapter/read-instructions" },
  { chinese: "看见自己", english: "See Yourself", href: "/chapter/chapter-1" },
  { chinese: "积极生活", english: "Live Positively", href: "/chapter/chapter-2" },
  { chinese: "清楚交代", english: "State Clearly", href: "/chapter/chapter-3" },
  { chinese: "好好告别", english: "Farewell Gracefully", href: "/chapter/chapter-4" },
];

const HomeChapterNav = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 z-20 pb-4 sm:pb-3">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4">
        <div className="bg-black/55 py-4 backdrop-blur-sm">
          <ul className="flex flex-col items-center justify-center gap-1 text-center text-white sm:flex-row sm:justify-around">
            {navItems.map((item) => (
              <li key={item.english} className="py-2 sm:py-0">
                <Link href={item.href} className="group block">
                  <span className="text-base font-semibold tracking-widest text-white transition-colors duration-300 group-hover:text-yellow-200 sm:text-lg">
                    {item.chinese}
                  </span>
                  <span className="mt-1 block text-sm font-medium uppercase tracking-wider text-white/90 sm:text-base">
                    {item.english}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-2 text-center text-[10px] leading-relaxed text-white/75 sm:mt-3 sm:text-[11px]">
          网站制作：思考熊 | 内容来源：《一生的整理》（全网同名：借假修真的思考熊）
        </div>
      </div>
    </footer>
  );



};

export default HomeChapterNav;
