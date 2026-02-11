import React from "react";
import Link from "next/link";

const AuthEntry = () => {
  return (
    <Link
      href="/login"
      className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-md hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
    >
      登录 / 注册
    </Link>
  );
};

export default AuthEntry;
