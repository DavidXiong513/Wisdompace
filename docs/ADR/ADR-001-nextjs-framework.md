# ADR-001: 使用 Next.js 作为前端框架

- 日期：2026-04-10
- 状态：已接受
- 决策人：@WisdomPace

## 背景

构建一个生命意义与人生规划平台，需要：
- 良好的 SEO 支持（内容驱动）
- 响应式设计（移动端友好）
- 服务端渲染能力（首屏加载速度）
- 现代 React 特性支持

## 决策

使用 **Next.js 16** 作为前端框架，配合 **App Router** 架构。

## 考虑因素

### 选项1：Next.js + App Router ✅

**优点：**
- 原生支持服务端组件（RSC）
- 自动代码分割和优化
- 内置图片、字体优化
- 优秀的开发体验（Turbopack）
- 静态生成（SSG）和服务端渲染（SSR）混合

**缺点：**
- 学习曲线较陡
- App Router 相对较新

### 选项2：Create React App + Vite

**优点：**
- 配置简单
- 生态成熟

**缺点：**
- 需要额外配置路由（React Router）
- 无内置 SSR/SSG 支持
- SEO 需要额外处理

### 选项3：Remix

**优点：**
- 注重 Web 标准
- 良好的表单处理

**缺点：**
- 生态相对较小
- 学习成本较高

## 决策理由

1. **SEO 优先**：内容平台需要搜索引擎友好
2. **性能**：Next.js 的图片优化和代码分割提升性能
3. **部署友好**：Vercel 原生支持，也可部署到其他平台
4. **长期维护**：Vercel 团队维护，更新活跃

## 技术栈细节

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.1.6 | 框架 |
| React | 19.2.3 | UI 库 |
| TypeScript | 5.x | 类型系统 |
| Tailwind CSS | 4.x | 样式 |

## 后果

**正面影响：**
- 首屏加载速度快
- SEO 表现良好
- 开发效率高

**负面影响：**
- 需要学习 Next.js 特有的概念（Server Components, Server Actions）
- 某些第三方库可能需要特殊处理

## 参考

- [Next.js 官方文档](https://nextjs.org/docs)
- [App Router 文档](https://nextjs.org/docs/app)
