/**
 * 安全工具库 - Security Utilities
 * 提供XSS防护、输入验证、数据清洗等安全功能
 */

import { ERROR_MESSAGES } from "@/config/security.config";

// ==================== XSS 防护 ====================

/**
 * HTML实体转义 - 防止XSS攻击
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";

  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * 移除所有HTML标签
 */
export function stripHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "");
}

/**
 * 清洗用户输入 - 移除危险字符和脚本
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // 移除script标签
    .replace(/on\w+\s*=/gi, "") // 移除事件处理器
    .replace(/javascript:/gi, "") // 移除javascript协议
    .replace(/data:/gi, "") // 移除data协议
    .replace(/vbscript:/gi, "") // 移除vbscript协议
    .trim();
}

// ==================== 输入验证 ====================

/**
 * 搜索查询验证
 */
export function validateSearchQuery(query: string): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!query || typeof query !== "string") {
    return { valid: false, sanitized: "", error: ERROR_MESSAGES.SEARCH_TOO_LONG };
  }

  const trimmed = query.trim();

  // 长度限制
  if (trimmed.length > 100) {
    return {
      valid: false,
      sanitized: trimmed.slice(0, 100),
      error: ERROR_MESSAGES.SEARCH_TOO_LONG,
    };
  }

  // 移除危险字符
  const sanitized = sanitizeInput(trimmed);

  // 检查是否只包含空白
  if (!sanitized || /^\s*$/.test(sanitized)) {
    return { valid: false, sanitized: "", error: "查询不能为空白" };
  }

  return { valid: true, sanitized };
}

/**
 * URL验证 - 仅允许安全的相对路径或同源URL
 */
export function validateUrl(url: string, allowedOrigins?: string[]): boolean {
  if (!url || typeof url !== "string") return false;

  // 允许相对路径
  if (url.startsWith("/") && !url.startsWith("//")) {
    // 检查路径遍历攻击
    if (url.includes("..")) return false;
    return true;
  }

  // 检查绝对URL
  try {
    const parsed = new URL(url);

    // 仅允许http和https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }

    // 检查是否在允许的源列表中
    if (allowedOrigins && allowedOrigins.length > 0) {
      return allowedOrigins.includes(parsed.origin);
    }

    // 默认仅允许同源
    if (typeof window !== "undefined") {
      return parsed.origin === window.location.origin;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * 验证脚本源 - 仅允许同源脚本
 */
export function validateScriptSrc(src: string): boolean {
  if (!src || typeof src !== "string") return false;

  // 仅允许相对路径的脚本
  if (src.startsWith("/") && !src.startsWith("//")) {
    // 禁止路径遍历
    if (src.includes("..")) return false;
    // 仅允许.js文件
    if (!src.endsWith(".js")) return false;
    return true;
  }

  // 禁止外部脚本
  return false;
}

// ==================== 数据验证 ====================

/**
 * localStorage数据结构验证
 */
export type StorageData = {
  readingProgress?: Record<
    string,
    {
      sectionId: string;
      timestamp: number;
    }
  >;
  toolStates?: Record<string, unknown>;
  userPreferences?: {
    theme?: string;
    fontSize?: string;
    language?: string;
  };
};

/**
 * 验证导入的数据结构
 */
export function validateStorageData(data: unknown): {
  valid: boolean;
  sanitized: StorageData;
  errors: string[];
} {
  const errors: string[] = [];
  const sanitized: StorageData = {};

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, sanitized: {}, errors: ["数据格式无效"] };
  }

  const obj = data as Record<string, unknown>;

  // 验证 readingProgress
  if (obj.readingProgress !== undefined) {
    if (
      typeof obj.readingProgress === "object" &&
      obj.readingProgress !== null &&
      !Array.isArray(obj.readingProgress)
    ) {
      sanitized.readingProgress = {};
      const progress = obj.readingProgress as Record<string, unknown>;

      for (const [key, value] of Object.entries(progress)) {
        // 验证key格式 (chapter-1, chapter-2 等)
        if (!/^[a-z0-9-]+$/i.test(key)) {
          errors.push(`无效的章节ID: ${key}`);
          continue;
        }

        if (
          typeof value === "object" &&
          value !== null &&
          "sectionId" in value &&
          "timestamp" in value
        ) {
          const entry = value as { sectionId: unknown; timestamp: unknown };

          if (
            typeof entry.sectionId === "string" &&
            /^[a-z0-9-]+$/i.test(entry.sectionId) &&
            typeof entry.timestamp === "number" &&
            entry.timestamp > 0
          ) {
            sanitized.readingProgress[key] = {
              sectionId: entry.sectionId,
              timestamp: entry.timestamp,
            };
          } else {
            errors.push(`章节 ${key} 的进度数据格式无效`);
          }
        }
      }
    } else {
      errors.push("readingProgress 格式无效");
    }
  }

  // 验证 userPreferences
  if (obj.userPreferences !== undefined) {
    if (
      typeof obj.userPreferences === "object" &&
      obj.userPreferences !== null &&
      !Array.isArray(obj.userPreferences)
    ) {
      const prefs = obj.userPreferences as Record<string, unknown>;
      sanitized.userPreferences = {};

      // 主题 - 白名单验证
      if (prefs.theme !== undefined) {
        const allowedThemes = ["warm", "dark", "light"];
        if (
          typeof prefs.theme === "string" &&
          allowedThemes.includes(prefs.theme)
        ) {
          sanitized.userPreferences.theme = prefs.theme;
        } else {
          sanitized.userPreferences.theme = "warm"; // 默认值
          errors.push("主题设置无效，已重置为默认值");
        }
      }

      // 字体大小 - 白名单验证
      if (prefs.fontSize !== undefined) {
        const allowedSizes = ["small", "medium", "large"];
        if (
          typeof prefs.fontSize === "string" &&
          allowedSizes.includes(prefs.fontSize)
        ) {
          sanitized.userPreferences.fontSize = prefs.fontSize;
        } else {
          sanitized.userPreferences.fontSize = "medium";
          errors.push("字体大小设置无效，已重置为默认值");
        }
      }

      // 语言 - 白名单验证
      if (prefs.language !== undefined) {
        const allowedLangs = ["zh-CN", "zh-TW", "en"];
        if (
          typeof prefs.language === "string" &&
          allowedLangs.includes(prefs.language)
        ) {
          sanitized.userPreferences.language = prefs.language;
        } else {
          sanitized.userPreferences.language = "zh-CN";
          errors.push("语言设置无效，已重置为默认值");
        }
      }
    } else {
      errors.push("userPreferences 格式无效");
    }
  }

  // toolStates 暂时不导入外部数据（安全考虑）
  if (obj.toolStates !== undefined) {
    errors.push("工具状态不支持导入，已跳过");
  }

  return {
    valid: errors.length === 0,
    sanitized,
    errors,
  };
}

// ==================== 安全常量 ====================

/**
 * 允许的样式表路径前缀
 */
export const ALLOWED_STYLESHEET_PATHS = ["/assets/css/", "/_next/static/"];

/**
 * 允许的脚本路径前缀
 */
export const ALLOWED_SCRIPT_PATHS = ["/assets/js/", "/_next/static/"];

/**
 * CSP nonce 生成（服务端使用）
 */
export function generateNonce(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  // 降级方案
  return Math.random().toString(36).substring(2, 15);
}
