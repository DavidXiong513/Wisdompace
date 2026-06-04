import type { NextConfig } from 'next';
import {
  buildCSPString,
  getCurrentSecurityPolicy,
  ALLOWED_IMAGE_PATTERNS,
} from './src/config/security.config';

/**
 * 安全响应头配置
 * 参考: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
 *
 * 配置说明：
 * - 开发环境：自动放宽限制，不启用CSP，便于调试和热重载
 * - 生产环境：启用完整安全策略
 * - 白名单配置：见 src/config/security.config.ts
 */

const securityPolicy = getCurrentSecurityPolicy();

function getSecurityHeaders() {
  const headers = [
    {
      // 防止点击劫持攻击
      key: 'X-Frame-Options',
      value: 'SAMEORIGIN',
    },
    {
      // 防止MIME类型嗅探攻击
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      // 启用XSS过滤器（现代浏览器内置）
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
    {
      // 控制引用来源信息
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      // 限制浏览器功能访问
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    },
    {
      // 强制 HTTPS（HSTS）
      // max-age=1年，包含子域名，允许加入浏览器预加载列表
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
    },
  ];

  // 仅在启用CSP时添加（生产环境）
  if (securityPolicy.enableCSP) {
    headers.push({
      key: 'Content-Security-Policy',
      value: buildCSPString(),
    });
  }

  return headers;
}

const nextConfig: NextConfig = {
  // React Compiler: Windows 开发环境禁用，Vercel (Linux) 生产构建时启用
  reactCompiler: process.env.NODE_ENV === 'production',

  // 安全响应头（根据环境自动调整）
  async headers() {
    return [
      {
        // 应用到所有路由
        source: '/(.*)',
        headers: getSecurityHeaders(),
      },
    ];
  },

  // 图片安全配置
  images: {
    // 远程图片白名单（可在 security.config.ts 中配置）
    remotePatterns: ALLOWED_IMAGE_PATTERNS,
    // 禁用危险的SVG优化
    dangerouslyAllowSVG: false,
  },

  // 生产环境优化
  poweredByHeader: false, // 移除X-Powered-By头，避免暴露技术栈

  // 严格模式（开发时双重渲染影响性能，生产保持开启）
  reactStrictMode: process.env.NODE_ENV === 'production',

  // 开发环境优化：详细日志
  ...(securityPolicy.logSecurityEvents && {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),
};

export default nextConfig;
