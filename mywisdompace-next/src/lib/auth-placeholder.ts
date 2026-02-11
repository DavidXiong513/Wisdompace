export type AuthUser = {
  id: string;
  name?: string;
};

/**
 * 认证占位：未来会替换为真实的 auth provider（如 NextAuth / 自建 JWT / Supabase Auth 等）。
 * 当前阶段只提供 API 形状，让 UI 与路由能提前对齐。
 */
export function getCurrentUser(): AuthUser | null {
  return null;
}
