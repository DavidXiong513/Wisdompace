# 安全配置快速使用指南

本文档说明如何使用新的安全配置系统，以及如何在不影响开发的情况下集成第三方服务。

## 📋 目录
- [环境区分策略](#环境区分策略)
- [集成第三方服务](#集成第三方服务)
- [数据导入功能](#数据导入功能)
- [错误信息配置](#错误信息配置)
- [常见问题](#常见问题)

---

## 环境区分策略

### 自动环境检测
系统会根据 `NODE_ENV` 自动应用不同的安全策略：

| 环境 | CSP状态 | 验证强度 | 调试信息 |
|------|---------|---------|---------|
| **开发环境** | ❌ 禁用 | 宽松 | ✅ 显示 |
| **生产环境** | ✅ 启用 | 严格 | ❌ 隐藏 |

### 开发体验优化
开发时无需关心安全限制：
- ✅ 热重载正常工作
- ✅ DevTools 可用
- ✅ 任意第三方库可加载
- ✅ 完整错误堆栈显示

---

## 集成第三方服务

### 配置文件位置
```
src/config/security.config.ts
```

### 常见集成场景

#### 1. Google Analytics
```typescript
// 1. 找到 ALLOWED_SCRIPT_DOMAINS
export const ALLOWED_SCRIPT_DOMAINS = [
  'https://www.googletagmanager.com', // ✅ 取消注释
  'https://hm.baidu.com',
];

// 2. 添加连接域名
export const ALLOWED_CONNECT_DOMAINS = [
  'https://analytics.google.com',      // ✅ 添加此行
];
```

#### 2. YouTube 视频嵌入
```typescript
export const ALLOWED_FRAME_DOMAINS = [
  'https://www.youtube.com',           // ✅ 取消注释
  'https://player.bilibili.com',
];
```

#### 3. CDN 图片
```typescript
export const ALLOWED_IMAGE_DOMAINS = [
  'https://cdn.example.com',           // ✅ 添加你的CDN
];

// Next.js 图片优化
export const ALLOWED_IMAGE_PATTERNS = [
  {
    protocol: 'https',
    hostname: 'cdn.example.com',
    pathname: '/images/**',
  },
];
```

#### 4. 外部字体 (Google Fonts)
```typescript
export const ALLOWED_STYLE_DOMAINS = [
  'https://fonts.googleapis.com',      // ✅ 取消注释
];

export const ALLOWED_CONNECT_DOMAINS = [
  'https://fonts.gstatic.com',         // ✅ 字体文件CDN
];
```

### 配置生效
修改配置文件后，无需其他操作：
- 开发环境：立即生效（热重载）
- 生产环境：重新构建 `npm run build`

---

## 数据导入功能

### 标准导入
```javascript
// 安全导入（推荐）
Storage.importData(file)
  .then(result => {
    if (result.warnings.length > 0) {
      alert(result.message); // 显示警告
      console.log('警告详情:', result.warnings);
    } else {
      alert('导入成功！');
    }
  })
  .catch(error => {
    alert('导入失败：' + error.message);
  });
```

**自动验证**：
- ✅ 文件类型检查（仅 `.json`）
- ✅ 文件大小限制（1MB）
- ✅ 数据格式验证
- ✅ 白名单过滤

### 降级方案（紧急情况）
```javascript
// 强制导入（跳过部分验证）
Storage.forceImportData(file)
  .then(result => {
    alert(result.message);
    console.warn('请手动检查数据完整性！');
  })
  .catch(error => {
    alert('强制导入失败：' + error.message);
  });
```

**使用场景**：
- 旧版本数据备份
- 格式略有差异的数据
- 紧急数据恢复

⚠️ **注意**：强制导入会记录日志，仅限紧急情况使用。

---

## 错误信息配置

### 自定义错误提示
```typescript
// src/config/security.config.ts
export const ERROR_MESSAGES = {
  INVALID_URL: '抱歉，该链接不安全...',     // ✅ 可自定义
  SEARCH_TOO_LONG: '搜索内容过长...',
  // ...更多错误信息
};
```

### 错误显示位置
- **用户界面**：简洁友好的中文提示
- **控制台**：详细的技术错误信息
- **开发环境**：额外的调试信息

---

## 常见问题

### Q1: 为什么开发时第三方脚本无法加载？
**A**: 开发环境已自动禁用 CSP，如仍有问题：
1. 检查浏览器控制台错误
2. 确认网络连接正常
3. 清除浏览器缓存

### Q2: 如何临时禁用安全验证？
**A**: 修改 `src/config/security.config.ts`：
```typescript
export const SECURITY_POLICY = {
  development: {
    enableStrictValidation: false, // ✅ 已禁用
  },
  production: {
    enableStrictValidation: false, // ⚠️ 不推荐
  },
};
```

### Q3: 数据导入提示"部分内容跳过"？
**A**: 这是正常的安全保护：
- 检查控制台的 `Import warnings`
- 确认被跳过的数据是否必要
- 使用 `forceImportData()` 强制导入（风险自负）

### Q4: 生产环境如何查看安全日志？
**A**: 
```typescript
// 启用日志
export const SECURITY_POLICY = {
  production: {
    logSecurityEvents: true, // ✅ 启用
  },
};
```
日志会输出到浏览器控制台（不影响用户体验）。

### Q5: 如何添加新的白名单域名？
**A**: 
1. 打开 `src/config/security.config.ts`
2. 找到对应的数组（如 `ALLOWED_SCRIPT_DOMAINS`）
3. 添加新域名字符串
4. 保存文件，自动生效

---

## 🔧 高级配置

### 动态白名单（运行时）
如果需要根据环境变量动态配置：
```typescript
// src/config/security.config.ts
export const ALLOWED_SCRIPT_DOMAINS = [
  'https://www.googletagmanager.com',
  ...(process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN 
    ? [process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN] 
    : []),
];
```

### 自定义 CSP 策略
```typescript
// 修改 buildCSPString() 函数
export function buildCSPString(): string {
  // 根据需要自定义 CSP 字符串
  return [
    `default-src 'self'`,
    `script-src 'self' ${ALLOWED_SCRIPT_DOMAINS.join(' ')}`,
    // ...
  ].join('; ');
}
```

---

## 📞 技术支持

遇到问题？
1. 查看浏览器控制台错误
2. 检查 `security.config.ts` 配置
3. 查阅 Next.js CSP 文档
4. 联系开发团队

---

**最后更新**: 2026-02-21  
**版本**: 1.0.0
