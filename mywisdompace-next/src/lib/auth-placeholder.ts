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

/**
 * 认证占位：未来会替换为真实的 auth provider（如 NextAuth / 自建 JWT / Supabase Auth 等）。
 * 当前阶段提供 API 形状，让 UI 与路由能提前对齐。
 */
export function getCurrentUser(): AuthUser | null {
  return null;
}

// ==================== 占位实现：登录 / 注册 ==================== //

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  // 简单邮箱格式校验：保守一些，后续可替换为更严格实现
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

export async function login(
  payload: LoginPayload,
): Promise<AuthResult<AuthUser>> {
  const email = payload.email.trim();
  const { password } = payload;

  if (!email || !password) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "请输入邮箱和密码",
    };
  }

  if (!isValidEmail(email)) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "请输入有效的邮箱地址",
    };
  }

  if (password.length < 6) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "密码长度至少 6 位",
    };
  }

  // 这里暂时忽略 rememberMe，未来接入真实后端时可用于控制会话时长

  await delay(600);

  // 占位逻辑：任何合法邮箱 + 足够长度的密码都视为成功
  return {
    ok: true,
    data: {
      id: "demo-user-id",
      name: email.split("@")[0] || "访客",
      email,
    },
  };
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResult<AuthUser>> {
  const name = payload.name.trim();
  const email = payload.email.trim();
  const { password, agreeTerms } = payload;

  if (!name) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "请输入昵称",
    };
  }

  if (!email) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "请输入邮箱",
    };
  }

  if (!isValidEmail(email)) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "请输入有效的邮箱地址",
    };
  }

  if (password.length < 6) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "密码长度至少 6 位",
    };
  }

  if (!agreeTerms) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "请先阅读并同意相关条款",
    };
  }

  await delay(800);

  return {
    ok: true,
    data: {
      id: "demo-user-id",
      name,
      email,
    },
  };
}
