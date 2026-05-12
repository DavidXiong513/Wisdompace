/**
 * 安全配置中心
 * 集中管理所有安全相关的白名单和策略
 *
 * 使用说明：
 * 1. 集成第三方服务时，在相应的白名单数组中添加域名
 * 2. 开发环境会自动禁用CSP，无需修改配置
 * 3. 所有配置变更会自动应用到 next.config.ts
 * 4. 错误提示信息统一在 ERROR_MESSAGES 中管理
 *
 * 快速集成示例：
 * - Google Analytics: 取消注释 ALLOWED_SCRIPT_DOMAINS 中的对应行
 * - YouTube视频: 取消注释 ALLOWED_FRAME_DOMAINS 中的对应行
 * - CDN图片: 在 ALLOWED_IMAGE_DOMAINS 中添加 CDN 域名
 */

// ==================== CSP 白名单配置 ====================

/**
 * 允许的外部脚本域名
 * 使用场景: 第三方分析、CDN、社交媒体插件
 */
export const ALLOWED_SCRIPT_DOMAINS = [
  // 'https://www.googletagmanager.com', // Google Analytics
  // 'https://hm.baidu.com',              // 百度统计
  // 'https://cdn.jsdelivr.net',          // JSDelivr CDN
];

/**
 * 允许的外部样式域名
 * 使用场景: 字体CDN、UI库CDN
 */
export const ALLOWED_STYLE_DOMAINS = [
  // 'https://fonts.googleapis.com',      // Google Fonts
  // 'https://cdn.jsdelivr.net',          // JSDelivr CDN
];

/**
 * 允许的图片源域名
 * 使用场景: CDN图片、用户头像、第三方图床
 */
export const ALLOWED_IMAGE_DOMAINS = [
  // 'https://cdn.example.com',           // 项目CDN
  // 'https://avatars.githubusercontent.com', // GitHub头像
];

/**
 * 允许的连接域名 (fetch/XHR)
 * 使用场景: API调用、第三方服务
 *
 * ⚠️ 安全原则：不要使用 https: 通配符，必须列出具体域名
 */
export const ALLOWED_CONNECT_DOMAINS = [
  'https://enubvdkirskacmtuzgys.supabase.co', // Supabase 项目
  'https://api.resend.com', // Resend 邮件 API
  'https://api.openai.com', // OpenAI API
  'https://api.moonshot.cn', // Kimi API
  'https://api.deepseek.com', // DeepSeek API
  // 'https://analytics.google.com',      // 分析服务
];

/**
 * 允许的iframe嵌入域名
 * 使用场景: 视频播放器、第三方内容嵌入
 */
export const ALLOWED_FRAME_DOMAINS = [
  // 'https://www.youtube.com',           // YouTube
  // 'https://player.bilibili.com',       // Bilibili
];

/**
 * Next.js 图片优化的远程域名模式
 */
export const ALLOWED_IMAGE_PATTERNS = [
  // {
  //   protocol: 'https',
  //   hostname: 'cdn.example.com',
  //   port: '',
  //   pathname: '/images/**',
  // },
];

// ==================== 输入验证配置 ====================

/**
 * 用户偏好白名单
 */
export const USER_PREFERENCES_WHITELIST = {
  themes: ['warm', 'dark', 'light'],
  fontSizes: ['small', 'medium', 'large'],
  languages: ['zh-CN', 'zh-TW', 'en'],
};

/**
 * 数据验证限制
 */
export const DATA_VALIDATION_LIMITS = {
  maxChapterIdLength: 50,
  maxSectionIdLength: 100,
  maxToolIdLength: 50,
  maxSearchQueryLength: 100,
  maxImportFileSizeBytes: 1024 * 1024, // 1MB
};

// ==================== 静态HTML安全配置 ====================

/**
 * 允许的本地脚本路径前缀
 */
export const ALLOWED_LOCAL_SCRIPT_PATHS = ['/assets/js/', './assets/js/', 'assets/js/'];

/**
 * 允许的本地样式路径前缀
 */
export const ALLOWED_LOCAL_STYLE_PATHS = ['/assets/css/', './assets/css/', 'assets/css/'];

// ==================== 错误提示配置 ====================

/**
 * 用户友好的错误提示
 */
export const ERROR_MESSAGES = {
  INVALID_URL: '抱歉，该链接不安全，无法访问。如有疑问请联系管理员。',
  INVALID_SCRIPT: '检测到不安全的脚本，已自动拦截以保护您的安全。',
  INVALID_FILE: '文件格式不支持或文件已损坏，请检查后重试。',
  FILE_TOO_LARGE: '文件大小超出限制（最大1MB），请压缩后重试。',
  SEARCH_TOO_LONG: '搜索内容过长，请缩短后重试（最多100字符）。',
  IMPORT_DATA_INVALID: '数据格式不符合要求，部分内容已被跳过。',
  IMPORT_DATA_CORRUPTED: '数据文件已损坏，无法导入。请使用最近的备份文件。',
};

// ==================== 安全策略开关 ====================

/**
 * 根据环境启用不同的安全策略
 */
export const SECURITY_POLICY = {
  // 开发环境：宽松策略，便于调试
  development: {
    enableCSP: false, // 开发时禁用CSP，避免阻止热重载
    enableStrictValidation: false, // 宽松验证
    showDebugInfo: true, // 显示调试信息
    logSecurityEvents: true, // 记录安全事件
  },

  // 生产环境：严格策略，最大化安全
  production: {
    enableCSP: true, // 启用完整CSP
    enableStrictValidation: true, // 严格验证
    showDebugInfo: false, // 隐藏调试信息
    logSecurityEvents: true, // 记录安全事件
  },

  // 测试环境：平衡策略
  test: {
    enableCSP: true,
    enableStrictValidation: true,
    showDebugInfo: true,
    logSecurityEvents: true,
  },
};

/**
 * 获取当前环境的安全策略
 */
export function getCurrentSecurityPolicy() {
  const env = (process.env.NODE_ENV || 'development') as keyof typeof SECURITY_POLICY;
  return SECURITY_POLICY[env] || SECURITY_POLICY.development;
}

// ==================== 辅助函数 ====================

/**
 * 构建CSP策略字符串
 */
export function buildCSPString(): string {
  const scriptSrc = [
    "'self'",
    // 仅在非生产环境启用 unsafe-eval，便于调试和热重载
    ...(isProduction() ? [] : ["'unsafe-eval'"]),
    "'unsafe-inline'", // React内联脚本
    ...ALLOWED_SCRIPT_DOMAINS,
  ];

  const styleSrc = [
    "'self'",
    "'unsafe-inline'", // Tailwind内联样式
    ...ALLOWED_STYLE_DOMAINS,
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    // ⚠️ 不使用 https: 通配符，只允许 Supabase 存储（头像等）
    ...(supabaseUrl ? [supabaseUrl] : []),
    ...ALLOWED_IMAGE_DOMAINS,
  ];

  const connectSrc = [
    "'self'",
    // ⚠️ 不使用 https: 通配符，必须列出具体域名（见 ALLOWED_CONNECT_DOMAINS）
    ...ALLOWED_CONNECT_DOMAINS,
  ];

  const frameSrc = ["'self'", ...ALLOWED_FRAME_DOMAINS];

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    `img-src ${imgSrc.join(' ')}`,
    `font-src 'self' data:`,
    `connect-src ${connectSrc.join(' ')}`,
    `frame-src ${frameSrc.join(' ')}`,
    `frame-ancestors 'self'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
  ].join('; ');
}

/**
 * 检查是否为开发环境
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
