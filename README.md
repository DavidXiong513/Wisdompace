MyWisdompace - 《一生的整理》官网

Next.js 实现的现代化网站，包含完整的安全架构和用户体验优化。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 生产构建

```bash
npm run build
npm run start
```

---

## 📚 重要文档

| 文档                                                   | 说明                 | 适用场景                     |
| ------------------------------------------------------ | -------------------- | ---------------------------- |
| [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)               | 安全配置快速使用指南 | 日常开发、集成第三方服务     |
| [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) | 安全架构详细设计     | 架构理解、团队规范、安全审查 |
| [AGENTS.md](../AGENTS.md)                              | 项目开发规范         | 代码风格、模块规范           |

---

## 🏗️ 项目结构

```
mywisdompace-next/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── (auth)/            # 认证相关页面（登录/注册）
│   │   ├── chapter/           # 章节页面
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   │   ├── NavBar.tsx        # 导航栏
│   │   ├── SearchPanel.tsx   # 搜索面板（带安全验证）
│   │   └── ...
│   ├── config/                # 配置文件
│   │   └── security.config.ts # 🔒 安全配置中心
│   ├── lib/                   # 工具库
│   │   ├── security.ts       # 🔒 安全工具函数
│   │   ├── search-index.ts   # 搜索索引
│   │   └── ...
│   └── data/                  # 数据文件
│       └── chapters.ts       # 章节内容
├── public/                    # 静态资源
├── next.config.ts            # 🔒 Next.js 配置（含安全头）
├── SECURITY_GUIDE.md         # 📖 安全使用指南
└── SECURITY_ARCHITECTURE.md  # 📖 安全架构文档
```

---

## 🔒 安全特性

### 生产级安全架构

- ✅ **完整的CSP策略**：防止XSS、数据注入、点击劫持
- ✅ **环境区分**：开发环境自动放宽限制，生产环境严格保护
- ✅ **输入验证**：搜索、数据导入、URL 白名单验证
- ✅ **XSS防护**：HTML转义、脚本源验证、内容清洗
- ✅ **配置集中化**：所有白名单统一管理
- ✅ **降级方案**：边缘案例支持强制导入

### 安全配置文件

- `src/config/security.config.ts` - 白名单和策略配置
- `src/lib/security.ts` - 安全工具函数库
- `next.config.ts` - 动态安全响应头

**详细说明**: 见 [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md)

---

## 🛠️ 技术栈

- **框架**: Next.js 16.1.6 (App Router + Turbopack)
- **UI**: React 19.2.3 + TypeScript 5
- **样式**: Tailwind CSS 4
- **编译**: React Compiler (实验性)
- **安全**: 自研安全架构（CSP + 输入验证 + XSS防护）

---

## 📦 npm 脚本

```bash
npm run dev      # 开发模式（热重载）
npm run build    # 生产构建
npm run start    # 启动生产服务器
npm run lint     # 代码检查
```

---

## 🔧 集成第三方服务

### 快速集成

编辑 `src/config/security.config.ts`，取消注释对应域名：

```typescript
// Google Analytics
export const ALLOWED_SCRIPT_DOMAINS = [
  'https://www.googletagmanager.com', // ✅ 取消注释
];

// YouTube 视频
export const ALLOWED_FRAME_DOMAINS = [
  'https://www.youtube.com', // ✅ 取消注释
];
```

**详细教程**: 见 [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)

---

## 🐛 常见问题

### Q: 开发时第三方脚本无法加载？

**A**: 开发环境已自动禁用CSP，检查网络和浏览器控制台。

### Q: 数据导入提示"部分内容跳过"？

**A**: 这是正常的安全保护，查看控制台警告，或使用 `forceImportData()`。

### Q: 如何添加新的白名单域名？

**A**: 编辑 `src/config/security.config.ts`，在对应数组中添加。

**更多问题**: 见 [SECURITY_GUIDE.md#常见问题](./SECURITY_GUIDE.md#常见问题)

---

## 📄 许可证

本项目遵循 MIT 许可证。

---

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [OWASP 安全指南](https://owasp.org/www-project-web-security-testing-guide/)

---

**最后更新**: 2026-02-21  
**版本**: 1.0.0

# Deploy trigger 1778335167
