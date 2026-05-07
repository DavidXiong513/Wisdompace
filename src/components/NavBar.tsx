"use client";

import React from "react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const NavBar = () => {
  const { user, isLoggedIn, logout } = useCurrentUser();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 p-4 sm:p-6">
      <nav className="container mx-auto flex items-center justify-between">
        <div>
          {/* Placeholder for logo or site title if needed in the future */}
          <Link href="/" className="text-lg font-bold text-white">
            一生的整理
          </Link>
        </div>

        {isLoggedIn && user ? (
          <div className="flex items-center gap-3">
            {/* 用户信息展示 */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C7A96A]/20 text-sm font-medium text-[#F8EBD5]">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden text-sm font-medium text-[#F8EBD5] sm:inline">
                {user.name || user.email?.split("@")[0] || "访客"}
              </span>
            </div>

            {/* 退出按钮 */}
            <button
              onClick={() => {
                logout();
                // 当前为内存模拟，未来接入真实后端时会清除服务端 session + Cookie
              }}
              className="rounded-md border border-[#E8D9C2] px-3 py-1.5 text-xs font-medium text-[#F8EBD5] transition duration-300 hover:bg-[#F6E9D2] hover:text-[#3D2B1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
              退出
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-md border border-[#E8D9C2] px-4 py-2 text-sm font-semibold text-[#F8EBD5] transition duration-300 hover:bg-[#F6E9D2] hover:text-[#3D2B1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          >
            登录 / 注册
          </Link>
        )}
      </nav>
    </header>
  );
};

export default NavBar;

