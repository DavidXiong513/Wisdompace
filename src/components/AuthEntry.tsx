import React from "react";
import Link from "next/link";

const AuthEntry = () => {
  return (
    <Link
      href="/login"
      className="rounded-md border border-[#E8D9C2] px-4 py-2 text-sm font-semibold text-[#F8EBD5] transition duration-300 hover:bg-[#F6E9D2] hover:text-[#3D2B1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
    >
      登录 / 注册
    </Link>
  );
};

export default AuthEntry;
