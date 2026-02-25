/**
 * 用户态管理 Hook
 * 
 * 当前阶段：仅占位实现，使用内存状态模拟
 * 未来接入真实后端时：
 * - 从 Cookie 读取 session token
 * - 调用 /api/auth/me 获取当前用户
 * - 处理 token 过期和刷新逻辑
 */

import { useState, useEffect } from "react";
import { AuthUser } from "@/lib/auth-placeholder";

// 内存模拟的全局用户状态（仅用于当前占位阶段）
let globalUser: AuthUser | null = null;

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(globalUser);

  useEffect(() => {
    // 未来这里会：
    // 1. 检查 Cookie 中的 session token
    // 2. 调用 /api/auth/me 验证并获取用户信息
    // 3. 处理 token 过期的情况
    
    // 当前占位阶段：从全局状态读取
    setUser(globalUser);
  }, []);

  const updateUser = (newUser: AuthUser | null) => {
    globalUser = newUser;
    setUser(newUser);
  };

  const logout = () => {
    // 未来这里会：
    // 1. 调用 /api/auth/logout 清除服务端 session
    // 2. 清除客户端 Cookie
    
    // 当前占位阶段：清空全局状态
    globalUser = null;
    setUser(null);
  };

  return {
    user,
    isLoggedIn: !!user,
    updateUser,
    logout,
  };
}

// 内部辅助函数：供登录/注册页面调用，模拟设置当前用户
export function setCurrentUserForDemo(user: AuthUser | null) {
  globalUser = user;
}
