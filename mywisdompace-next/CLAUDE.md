# MyWisdompace-next 项目指南

> 《一生的整理》官方网站 — 生命意义与人生规划平台  
> 最后更新：2026-04-08

---

## 🎯 项目定位

帮助用户认真回顾此生、整理人生、做好准备的数字化平台。分为「积极生活」和「坦然告别」两大部分。

---

## 📚 四大篇章

| 篇章 | 路由 | 主题 | 状态 |
|------|------|------|------|
| 预备此生 | `/chapter/read-instructions` | 缘起、初衷、预备自测 | ✅ 完成 |
| 看见自己 | `/chapter/chapter-1` | 社会角色、身份标签、剥去角色 | ✅ 完成 |
| 积极生活 | `/chapter/chapter-2` | 主动选择、生活趣味、人生意义 | ✅ 完成 |
| 清楚交代 | `/chapter/chapter-3` | 责任清单、选择权、安排 | ✅ 完成 |
| 好好告别 | `/chapter/chapter-4` | 告别清单、告别方式、从容告别 | ✅ 完成 |

---

## 🛠️ 技术栈

- **框架**: Next.js 16.1.6 (App Router + Turbopack)
- **UI**: React 19.2.3 + TypeScript 5
- **样式**: Tailwind CSS 4
- **状态**: Zustand (persist 中间件)
- **编译**: React Compiler (实验性)
- **国际化**: i18next

---

## 📁 关键文件路径

```
src/
├── app/
│   ├── page.tsx                 # 首页（搜索入口）
│   ├── layout.tsx               # 根布局
│   ├── search/page.tsx          # 搜索结果页
│   └── chapter/
│       ├── read-instructions/   # 预备此生
│       ├── chapter-1/ ~ chapter-4/  # 四大篇章
│       └── [slug]/page.tsx      # 动态章节路由
├── components/
│   ├── NavBar.tsx               # 导航栏
│   ├── HomeChapterNav.tsx       # 首页底部导航
│   ├── SearchPanel.tsx          # 搜索面板
│   ├── chapter/ChapterReader.tsx    # 章节阅读器
│   └── tools/ToolContainer.tsx      # 工具容器（含错误边界）
├── config/
│   └── security.config.ts       # 安全配置中心（CSP、白名单）
├── data/
│   └── chapters.ts              # 章节内容数据（核心内容源）
├── lib/
│   ├── security.ts              # XSS防护、输入验证工具
│   ├── search-index.ts          # 搜索索引与检索逻辑
│   └── tools.ts                 # 工具注册表
├── hooks/
│   └── useCurrentUser.ts        # 用户状态（当前为内存模拟）
└── stores/
    ├── readingProgressStore.ts  # 阅读进度（localStorage持久化）
    ├── preferencesStore.ts      # 用户偏好设置
    └── toolStateStore.ts        # 工具状态管理
```

---

## ✅ 已完成功能

- [x] 首页 Hero + 搜索入口
- [x] 全站搜索（章节内容 + 预备页面）
- [x] 四大篇章内容录入
- [x] 章节阅读器（自动保存进度）
- [x] 阅读进度持久化（IntersectionObserver + Zustand）
- [x] 响应式布局（移动端适配）
- [x] 安全架构（CSP、XSS防护、输入验证）
- [x] 工具容器框架（Error Boundary + 状态管理）
- [x] 导航栏（登录状态显示）

---

## 🚧 进行中/待办

- [ ] **用户认证系统**：当前为内存模拟，需接入真实后端
  - Cookie-based session
  - 登录/注册 API
  - Token 过期处理
- [ ] **交互工具实现**：框架就绪，具体工具待开发
  - role-pie-chart（社会角色饼图）
  - tag-selector（身份标签选择器）
  - role-stripper（角色剥离工具）
  - life-finder（生活趣味发现）
  - choice-maker（选择练习）
  - responsibility-list（责任清单）
  - choice-rights（选择权安排）
  - goodbye-list（告别清单）
- [ ] **用户数据持久化**：工具状态、阅读进度云端同步
- [ ] **数据分析**：用户行为追踪（需考虑隐私）

---

## 🔒 安全要点

1. **CSP策略**：生产环境启用，开发环境自动禁用
2. **输入验证**：搜索长度限制100字符，数据导入1MB限制
3. **XSS防护**：HTML转义、脚本源验证
4. **配置中心**：所有白名单集中在 `security.config.ts`

---

## 📝 内容更新指南

章节内容存储在 `src/data/chapters.ts`，结构：

```typescript
{
  slug: "chapter-1",
  title: "第一篇｜看见自己",
  subtitle: "...",
  description: "...",
  sections: [
    {
      id: "section-id",
      title: "小节标题",
      paragraphs: ["段落1", "段落2"],
      questions?: ["思考题1"],  // 可选
      toolId?: "tool-name"      // 关联工具，可选
    }
  ]
}
```

---

## 🎨 设计系统

CSS 变量定义（暖色调主题）：
- `--wp-bg`: 主背景
- `--wp-bg-alt`: 次级背景
- `--wp-card-bg`: 卡片背景
- `--wp-ink`: 主文字
- `--wp-ink-light`: 次级文字
- `--wp-ink-muted`: 弱化文字
- `--wp-accent`: 强调色（金色 #C9A15A）
- `--wp-gold`: 金色
- `--wp-border`: 边框色
- `--wp-font-serif`: 衬线字体（中文标题）
- `--wp-font-sans`: 无衬线字体（正文）

---

## 🐛 已知问题

暂无

---

## 📌 会话记录

| 日期 | 工作内容 | 状态 |
|------|---------|------|
| 2026-04-08 | 项目熟悉与文档创建 | ✅ 完成 |

