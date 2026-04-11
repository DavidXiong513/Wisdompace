/**
 * 认证类型定义（供全项目共享）
 *
 * ⚠️ 注意：login / registerUser / getCurrentUser 等占位函数已废弃，
 * 请使用 stores/authStore 中的 login / register / logout 方法。
 * 本文件仅保留类型定义。
 */

export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  agreeTerms: boolean;
};

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: AuthErrorCode };
