# 安全架构详细设计文档

本文档详细说明本项目的安全架构设计、实现原理和维护规范。

**目标读者**: 架构师、安全工程师、技术主管、新加入团队的开发者

**文档版本**: 1.0.0  
**最后更新**: 2026-02-21

---

## 📑 目录

1. [架构概述](#架构概述)
2. [核心设计原则](#核心设计原则)
3. [安全防护层级](#安全防护层级)
4. [关键文件说明](#关键文件说明)
5. [技术实现细节](#技术实现细节)
6. [开发规范](#开发规范)
7. [部署检查清单](#部署检查清单)
8. [应急响应](#应急响应)

---

## 架构概述

### 设计目标

1. **零信任架构**: 所有输入视为不可信，所有输出需验证
2. **纵深防御**: 多层安全机制，单点失效不导致整体崩溃
3. **开发友好**: 开发环境零障碍，生产环境强保护
4. **可维护性**: 配置集中化，文档完善，易于扩展

### 架构图

```
┌─────────────────────────────────────────────────────┐
│                  用户浏览器                          │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  第一层: HTTP 安全响应头 (next.config.ts)            │
│  - Content-Security-Policy (CSP)                     │
│  - X-Frame-Options, X-XSS-Protection                 │
│  - 环境区分: 开发禁用 / 生产启用                      │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  第二层: 输入验证 (security.ts)                       │
│  - URL 白名单验证                                     │
│  - 搜索查询验证                                       │
│  - 数据导入验证                                       │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  第三层: 内容清洗 (security.ts)                       │
│  - HTML 实体转义                                      │
│  - 脚本标签过滤                                       │
│  - 事件处理器移除                                     │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  第四层: 应用逻辑                                     │
│  - React 组件 (默认 XSS 防护)                         │
│  - 业务逻辑处理                                       │
└──────────────────────────────────────────────────────┘
```

---

## 核心设计原则

### 1. 环境区分策略

#### 问题背景
传统安全架构在开发环境启用严格CSP会导致：
- 热重载失效
- DevTools 被阻止
- 第三方库加载失败
- 开发效率显著下降

#### 解决方案
根据 `NODE_ENV` 动态启用安全策略：

**开发环境 (`development`)**:
- ❌ 禁用 CSP
- ✅ 保留基础安全头
- ✅ 显示调试信息
- ✅ 宽松验证（警告但不阻止）

**生产环境 (`production`)**:
- ✅ 启用完整 CSP
- ✅ 严格验证
- ❌ 隐藏调试信息
- ✅ 记录安全事件

#### 实现代码
```typescript
// src/config/security.config.ts
export const SECURITY_POLICY = {
  development: {
    enableCSP: false,
    enableStrictValidation: false,
    showDebugInfo: true,
  },
  production: {
    enableCSP: true,
    enableStrictValidation: true,
    showDebugInfo: false,
  },
};

// next.config.ts
const policy = getCurrentSecurityPolicy();
if (policy.enableCSP) {
  headers.push({ key: "Content-Security-Policy", value: buildCSPString() });
}
```

---

### 2. 配置集中化

#### 问题背景
- 白名单分散在多个文件，维护困难
- 集成第三方服务需要修改多处
- 配置变更容易遗漏
- 团队成员不知道去哪修改

#### 解决方案
创建统一配置文件 `security.config.ts`：

**单一入口**:
```typescript
// 所有白名单集中管理
export const ALLOWED_SCRIPT_DOMAINS = [ /* ... */ ];
export const ALLOWED_STYLE_DOMAINS = [ /* ... */ ];
export const ALLOWED_IMAGE_DOMAINS = [ /* ... */ ];
export const ALLOWED_FRAME_DOMAINS = [ /* ... */ ];
```

**注释示例**:
```typescript
export const ALLOWED_SCRIPT_DOMAINS = [
  // 'https://www.googletagmanager.com', // ✅ 取消注释即可
  // 'https://hm.baidu.com',              // 百度统计
];
```

**自动应用**:
```typescript
// next.config.ts 自动读取配置
import { buildCSPString } from './src/config/security.config';
```

---

### 3. 降级方案设计

#### 问题背景
- 严格验证会拒绝合法的边缘案例
- 旧版本数据无法导入
- 用户数据迁移受阻
- 无应急恢复手段

#### 解决方案
提供多级验证机制：

**标准验证 (推荐)**:
```javascript
// 严格验证，保证安全
Storage.importData(file)
  .then(result => {
    if (result.warnings.length > 0) {
      alert(`数据导入完成，但有 ${result.warnings.length} 个警告`);
    }
  });
```

**强制导入 (应急)**:
```javascript
// 跳过部分验证，记录日志
Storage.forceImportData(file)
  .then(result => {
    alert('强制导入成功！请手动检查数据完整性。');
    console.warn('FORCE IMPORT: User bypassed validation');
  });
```

**验证流程**:
```
用户上传文件
    ↓
标准验证 (validateImportData)
    ↓
通过? → 导入成功
    ↓
失败? → 显示详细错误 + 提供"强制导入"选项
    ↓
用户确认? → forceImportData (记录日志)
```

---

### 4. 用户体验优先

#### 问题背景
- 技术错误信息用户无法理解
- "SecurityError: CSP violation" 吓跑用户
- 开发者需要调试信息
- 普通用户只需要知道"怎么办"

#### 解决方案
分层错误提示：

**用户界面层**:
```javascript
showUserError(
  '抱歉，该链接不安全，无法访问。如有疑问请联系管理员。',
  technicalDetails
);
```

**控制台层** (技术细节):
```javascript
console.error('Security Error:', 'Invalid URL: javascript:alert(1)');
```

**开发环境层** (完整堆栈):
```javascript
if (isDevelopment) {
  console.info('Technical Details:', fullStackTrace);
}
```

---

## 安全防护层级

### 第一层: HTTP 安全响应头

**位置**: `next.config.ts`

#### 防护内容

| 响应头 | 作用 | 攻击类型 |
|--------|------|---------|
| `Content-Security-Policy` | 限制资源加载源 | XSS、数据注入 |
| `X-Frame-Options: SAMEORIGIN` | 禁止跨域iframe | 点击劫持 |
| `X-Content-Type-Options: nosniff` | 禁止MIME嗅探 | MIME混淆攻击 |
| `X-XSS-Protection: 1; mode=block` | 启用浏览器XSS过滤 | 反射型XSS |
| `Referrer-Policy` | 控制引用来源 | 信息泄露 |
| `Permissions-Policy` | 限制浏览器API | 权限滥用 |

#### CSP 策略详解

```typescript
Content-Security-Policy:
  default-src 'self';                    // 默认仅同源
  script-src 'self' 'unsafe-eval'        // 脚本: 同源 + eval (Next.js需要)
             'unsafe-inline'             //       + inline (React需要)
             https://example.com;        //       + 白名单域名
  style-src 'self' 'unsafe-inline';      // 样式: 同源 + inline (Tailwind)
  img-src 'self' data: blob: https:;     // 图片: 同源 + data/blob + HTTPS
  font-src 'self' data:;                 // 字体: 同源 + data URI
  connect-src 'self' https:;             // 连接: 同源 + HTTPS
  frame-src 'self';                      // iframe: 仅同源
  frame-ancestors 'self';                // 嵌入: 仅同源
  form-action 'self';                    // 表单: 仅同源
  base-uri 'self';                       // base标签: 仅同源
  object-src 'none';                     // object/embed: 禁止
```

**为什么需要 `'unsafe-eval'` 和 `'unsafe-inline'`?**
- `'unsafe-eval'`: Next.js 开发模式热重载需要
- `'unsafe-inline'`: React内联事件 + Tailwind内联样式

**生产环境优化** (可选):
- 使用 nonce 替代 `'unsafe-inline'`
- 移除 `'unsafe-eval'` (仅生产构建)

---

### 第二层: 输入验证

**位置**: `src/lib/security.ts`

#### 验证函数

##### 1. URL 验证
```typescript
validateUrl(url: string): boolean {
  // 仅允许相对路径
  if (url.startsWith('/') && !url.startsWith('//')) {
    if (url.includes('..')) return false; // 禁止路径遍历
    return true;
  }
  // 仅允许同源绝对路径
  if (url.startsWith(window.location.origin)) {
    return true;
  }
  return false; // 拒绝其他所有URL
}
```

**防护**: 路径遍历、恶意跳转、XSS via href

##### 2. 搜索查询验证
```typescript
validateSearchQuery(query: string): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  // 长度限制
  if (query.length > 100) return { valid: false, error: '...' };
  
  // 清洗危险字符
  const sanitized = sanitizeInput(query);
  
  return { valid: true, sanitized };
}
```

**防护**: SQL注入、XSS、DoS

##### 3. 数据导入验证
```typescript
validateStorageData(data: unknown): {
  valid: boolean;
  sanitized: StorageData;
  errors: string[];
} {
  // 白名单验证
  if (theme && ALLOWED_THEMES.includes(theme)) {
    sanitized.theme = theme;
  } else {
    errors.push('主题设置无效');
    sanitized.theme = 'warm'; // 默认值
  }
  
  // ID格式验证
  if (!/^[a-zA-Z0-9_-]+$/.test(chapterId)) {
    errors.push(`无效的章节ID: ${chapterId}`);
  }
  
  return { valid, sanitized, errors };
}
```

**防护**: 代码注入、数据污染、原型链污染

---

### 第三层: 内容清洗

**位置**: `src/lib/security.ts`, `assets/js/router.js`

#### 清洗函数

##### 1. HTML 实体转义
```typescript
escapeHtml(str: string): string {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
}
```

**使用场景**: 显示用户输入、动态标题、错误消息

##### 2. HTML 内容清洗
```typescript
sanitizeHtml(html: string): string {
  // 移除 <script> 标签
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 移除事件处理器
  html = html.replace(/\s*on\w+\s*=\s*(["'])[^"']*\1/gi, '');
  
  // 移除危险协议
  html = html.replace(/javascript:/gi, '');
  html = html.replace(/data:(?!image\/)/gi, '');
  
  return html;
}
```

**使用场景**: SPA 路由 innerHTML、富文本编辑器

##### 3. 脚本源验证
```typescript
validateScriptSrc(src: string): boolean {
  // 白名单路径
  const allowedPaths = ['/assets/js/', './assets/js/'];
  if (!allowedPaths.some(path => src.startsWith(path))) {
    return false;
  }
  
  // 禁止路径遍历
  if (src.includes('..')) return false;
  
  // 必须是 .js 文件
  if (!src.endsWith('.js')) return false;
  
  return true;
}
```

**使用场景**: 动态脚本加载、SPA 路由

---

## 关键文件说明

### 1. `src/config/security.config.ts`

**作用**: 安全配置中心，所有白名单和策略统一管理

**主要导出**:
```typescript
// 白名单数组
export const ALLOWED_SCRIPT_DOMAINS: string[];
export const ALLOWED_STYLE_DOMAINS: string[];
export const ALLOWED_IMAGE_DOMAINS: string[];
export const ALLOWED_CONNECT_DOMAINS: string[];
export const ALLOWED_FRAME_DOMAINS: string[];

// 验证配置
export const USER_PREFERENCES_WHITELIST: { themes, fontSizes, languages };
export const DATA_VALIDATION_LIMITS: { maxChapterIdLength, ... };

// 错误信息
export const ERROR_MESSAGES: { INVALID_URL, SEARCH_TOO_LONG, ... };

// 策略配置
export const SECURITY_POLICY: { development, production };

// 工具函数
export function getCurrentSecurityPolicy(): SecurityPolicy;
export function buildCSPString(): string;
```

**修改频率**: 高（集成第三方服务时）

---

### 2. `src/lib/security.ts`

**作用**: 安全工具函数库，提供验证和清洗功能

**主要导出**:
```typescript
// XSS 防护
export function escapeHtml(str: string): string;
export function stripHtml(str: string): string;
export function sanitizeInput(input: string): string;

// 输入验证
export function validateSearchQuery(query: string): ValidationResult;
export function validateUrl(url: string, allowedOrigins?: string[]): boolean;
export function validateScriptSrc(src: string): boolean;

// 数据验证
export function validateStorageData(data: unknown): ValidationResult;
```

**修改频率**: 低（仅新增验证逻辑时）

---

### 3. `next.config.ts`

**作用**: Next.js 配置，动态生成安全响应头

**关键逻辑**:
```typescript
import { getCurrentSecurityPolicy, buildCSPString } from './src/config/security.config';

const policy = getCurrentSecurityPolicy();

function getSecurityHeaders() {
  const headers = [
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    // ... 其他基础安全头
  ];
  
  // 仅生产环境启用 CSP
  if (policy.enableCSP) {
    headers.push({
      key: "Content-Security-Policy",
      value: buildCSPString(),
    });
  }
  
  return headers;
}
```

**修改频率**: 极低（仅架构变更时）

---

### 4. `assets/js/router.js` (静态HTML版)

**作用**: SPA 路由系统，带安全验证

**关键安全函数**:
```javascript
const Router = {
  // 安全验证函数
  validateUrl(url) { /* ... */ },
  validateScriptSrc(src) { /* ... */ },
  validateStyleSrc(href) { /* ... */ },
  sanitizeHtml(html) { /* ... */ },
  escapeHtml(str) { /* ... */ },
  
  // 用户友好错误
  showUserError(message, technicalDetails) { /* ... */ },
  
  // 安全内容替换
  replaceContent(newDoc) {
    const sanitizedHtml = this.sanitizeHtml(newBody.innerHTML);
    currentBody.innerHTML = sanitizedHtml;
    // ...
  },
};
```

**修改频率**: 低

---

### 5. `assets/js/storage.js` (静态HTML版)

**作用**: localStorage 管理，带数据验证

**关键安全函数**:
```javascript
const Storage = {
  // 验证函数
  isValidId(str, maxLength) { /* ... */ },
  isValidTimestamp(ts) { /* ... */ },
  validateImportData(data) { /* ... */ },
  
  // 标准导入（严格验证）
  importData(file) { /* ... */ },
  
  // 强制导入（降级方案）
  forceImportData(file) { /* ... */ },
};
```

**修改频率**: 低

---

## 技术实现细节

### 静态HTML版 vs Next.js版

| 特性 | 静态HTML版 | Next.js版 |
|------|-----------|----------|
| **路由** | SPA (router.js) | App Router |
| **XSS防护** | 手动清洗 (sanitizeHtml) | React自动 + security.ts |
| **CSP** | 无 | 完整策略 |
| **验证** | router.js + storage.js | security.ts |
| **配置** | 硬编码 | security.config.ts |
| **环境区分** | 无 | 自动 |

**迁移建议**: 优先使用 Next.js 版，静态HTML版仅用于无法使用框架的场景。

---

### React 组件安全最佳实践

#### ✅ 推荐做法

```tsx
// 1. 使用 React 默认转义
<div>{userInput}</div>  // ✅ 自动转义

// 2. 验证后再使用
const validation = validateSearchQuery(query);
if (validation.valid) {
  <input value={validation.sanitized} />
}

// 3. 限制输入长度
<input maxLength={100} />

// 4. 使用 type 限制
<input type="url" />  // 浏览器验证
```

#### ❌ 避免做法

```tsx
// 1. 永远不要用 dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // ❌

// 2. 不验证就使用
<div>{userInput}</div>  // ❌ 如果是 URL/富文本

// 3. 拼接HTML字符串
const html = "<div>" + userInput + "</div>";  // ❌

// 4. 动态属性
<a href={userInput}>Link</a>  // ❌ 未验证的URL
```

---

## 开发规范

### 新增功能时的安全检查清单

- [ ] **输入验证**: 所有用户输入都需要验证
  - 搜索框、表单、URL参数、文件上传
  - 使用 `security.ts` 中的验证函数
  - 定义合理的长度/格式限制

- [ ] **输出编码**: 所有动态内容需要转义
  - 使用 React 默认转义（大多数情况）
  - 需要HTML时先清洗（sanitizeHtml）
  - URL 使用 encodeURIComponent

- [ ] **第三方集成**: 添加到白名单
  - 编辑 `security.config.ts`
  - 测试 CSP 是否生效
  - 更新文档说明原因

- [ ] **敏感信息**: 不要暴露
  - 生产环境隐藏调试信息
  - API密钥使用环境变量
  - 错误消息不包含路径/堆栈

- [ ] **测试**: 安全测试
  - 尝试XSS攻击向量
  - 检查CSP违规（浏览器控制台）
  - 验证错误提示用户友好

### 代码审查要点

1. **是否有 `innerHTML`?** → 必须使用 `sanitizeHtml()`
2. **是否有动态URL?** → 必须使用 `validateUrl()`
3. **是否有文件上传?** → 必须验证类型/大小
4. **是否有新域名?** → 必须加入 `security.config.ts`
5. **是否有敏感日志?** → 生产环境必须禁用

---

## 部署检查清单

### 部署前检查

```bash
# 1. 构建测试
npm run build

# 2. 类型检查
npx tsc --noEmit

# 3. 依赖审计
npm audit

# 4. 生产环境测试
NODE_ENV=production npm run start
```

### 部署后验证

#### 1. 检查安全响应头
```bash
curl -I https://your-domain.com
```

应该看到:
```
HTTP/2 200
content-security-policy: default-src 'self'; ...
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
```

#### 2. 检查 CSP 生效
1. 打开浏览器开发者工具
2. 访问网站
3. 检查 Console 标签
4. 不应该有 CSP 违规错误

#### 3. 测试第三方服务
- Google Analytics 正常工作
- 嵌入视频正常播放
- CDN资源正常加载

#### 4. 安全扫描（可选）
```bash
# 使用 OWASP ZAP 或其他工具
zap-cli quick-scan -s all https://your-domain.com
```

---

## 应急响应

### 发现安全漏洞

#### 1. 立即行动
- [ ] 确认漏洞真实性和影响范围
- [ ] 通知技术负责人和团队
- [ ] 如果严重，考虑临时下线

#### 2. 快速修复
```bash
# 临时禁用功能
git revert <commit-hash>
npm run build
npm run start

# 或强制启用严格模式
# 修改 security.config.ts
export const SECURITY_POLICY = {
  production: {
    enableStrictValidation: true, // 强制启用
  }
};
```

#### 3. 根本解决
- 分析漏洞根本原因
- 编写修复代码
- 添加测试用例防止复发
- 更新安全文档

#### 4. 事后复盘
- 漏洞如何产生？
- 为什么现有防护未生效？
- 需要改进哪些流程？
- 更新检查清单

### 常见安全事件处理

#### CSP 违规过多
**症状**: 浏览器控制台大量 CSP 错误

**排查**:
```javascript
// 临时收集违规报告
// 添加到 next.config.ts
headers.push({
  key: "Content-Security-Policy-Report-Only",
  value: buildCSPString() + "; report-uri /api/csp-report"
});
```

**解决**: 将合法域名添加到 `security.config.ts` 白名单

#### 数据导入失败
**症状**: 用户无法导入备份数据

**排查**:
```javascript
// 查看详细日志
Storage.importData(file)
  .then(result => {
    console.log('Validation errors:', result.warnings);
  });
```

**解决**: 提供 `forceImportData()` 选项，或更新验证规则

---

## 附录

### A. CSP 指令速查表

| 指令 | 说明 | 示例 |
|------|------|------|
| `default-src` | 默认源 | `'self'` |
| `script-src` | 脚本源 | `'self' https://cdn.com` |
| `style-src` | 样式源 | `'self' 'unsafe-inline'` |
| `img-src` | 图片源 | `'self' data: https:` |
| `font-src` | 字体源 | `'self' data:` |
| `connect-src` | 连接源 (fetch/XHR) | `'self' https:` |
| `frame-src` | iframe源 | `'self'` |
| `frame-ancestors` | 嵌入源 | `'self'` |
| `form-action` | 表单提交源 | `'self'` |
| `object-src` | object/embed | `'none'` |

### B. 安全工具推荐

- **CSP 测试**: [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- **依赖扫描**: `npm audit`, Snyk
- **漏洞扫描**: OWASP ZAP, Burp Suite
- **静态分析**: ESLint Security Plugin
- **运行时监控**: Sentry + CSP报告

### C. 学习资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP 最佳实践](https://scotthelme.co.uk/content-security-policy-an-introduction/)
- [React Security](https://react.dev/learn/security)

---

## 文档维护

### 更新记录

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|---------|------|
| 1.0.0 | 2026-02-21 | 初始版本 | Security Team |

### 贡献指南

发现文档问题或有改进建议？

1. 创建 Issue 描述问题
2. 提交 PR 修改文档
3. 联系安全团队审核

---

**文档结束**

如有疑问，请参考 [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) 或联系技术团队。
