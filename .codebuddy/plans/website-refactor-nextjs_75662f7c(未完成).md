---
name: website-refactor-nextjs
overview: 为《一生的整理》网站制定基于 Next.js + React 19 + TypeScript + Tailwind 的渐进式重构方案，聚焦视觉升级与信息架构整理，并新增检索/目录功能且保持现有交互。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - 温暖人文
    - 玻璃拟态
    - 轻赛博点缀
    - 沉浸阅读
    - 微交互动效
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 32px
      weight: 600
    subheading:
      size: 20px
      weight: 500
    body:
      size: 16px
      weight: 400
  colorSystem:
    primary:
      - "#E8C872"
      - "#CFAE5D"
    background:
      - "#F5E6D3"
      - "#FFF9F0"
      - "#1A1A2E"
    text:
      - "#3D2B1F"
      - "#5D4A3A"
      - "#FFFFFF"
    functional:
      - "#00F0FF"
      - "#BD00FF"
      - "#D97706"
todos:
  - id: audit-current-site
    content: 使用 [subagent:code-explorer] 完整梳理现有页面结构与交互清单
    status: pending
  - id: setup-next-app
    content: 搭建 Next.js 新站骨架与全局布局，保留原站点作为对照
    status: completed
    dependencies:
      - audit-current-site
  - id: migrate-home
    content: 迁移首页并完成视觉升级与信息架构重组
    status: in_progress
    dependencies:
      - setup-next-app
  - id: build-chapter-template
    content: 实现章节页模板、目录导航与阅读进度逻辑
    status: pending
    dependencies:
      - migrate-home
  - id: add-search
    content: 接入全站检索与结果展示，构建内容索引数据结构
    status: pending
    dependencies:
      - build-chapter-template
  - id: gradual-rollout
    content: 按章节逐步迁移其余页面并进行回归验证
    status: pending
    dependencies:
      - add-search
---

## 用户需求

- 对现有站点进行重构，重点在视觉升级与信息架构整理
- 在保持现有页面交互不变的前提下，新增检索与目录等常见功能
- 内容结构后续由用户补充完善
- 采用渐进式迁移方式，分阶段替换页面
- 内容来源：先用本地静态数据（json/ts），后续再迁移到 CMS
- 检索范围：全量正文检索（注意索引体积与性能权衡）
- 迁移承载：新建独立仓库，旧站不保留
- 发布节奏：先本地预览，再上传 Git 替换旧版

## 产品概览

- 多页面阅读型网站，包含首页与章节内容页，强调安静、温暖与科技感融合的阅读体验
- 强化可发现性与可导航性，通过检索与目录提升内容访问效率

## 核心功能

- 首页与章节页结构升级，层级清晰、信息组织更有序
- 全站检索入口与结果展示
- 章节内目录/大纲定位与阅读进度提示
- 现有交互效果与工具占位保持一致
- 预留用户注册/登录入口与权限扩展位（后续接入）

## 技术栈选择

- 框架：Next.js（App Router）
- UI：React 19 + TypeScript
- 样式：Tailwind CSS
- 客户端交互：浏览器原生 API + 轻量工具函数（保持现有交互逻辑的可复用性）

## 实现思路

- 采用“新仓库 + 渐进式迁移”策略：以全新 Next.js 仓库为载体，旧站仅作参考，不纳入迁移目录，逐页对齐交互与视觉。
- 以“信息架构重组 + 视觉系统升级”为核心，先搭建统一布局与组件体系，再落地首页与章节模板，最后接入检索与目录。
- 性能上将检索索引预构建为静态数据，客户端仅做轻量过滤；目录与阅读进度使用 IntersectionObserver，避免滚动计算过于频繁。

## 关键执行说明

- 交互保持一致：导航切换、章节滚动定位、阅读进度存储、工具占位状态需与当前实现对齐。
- 渐进迁移：先迁移首页与一个章节页，验证视觉与交互，再批量迁移其余章节。
- 新仓库执行：以新仓库为唯一交付载体，旧站仅作为对照资料。

## 架构设计

- 页面层：首页、章节页（统一模板）、认证页（登录/注册占位）
- 组件层：导航、页脚、章节导航、工具占位卡片、检索入口与结果面板、登录入口/用户态占位（导航栏右上角独立按钮）
- 数据层：章节结构与内容数据（后续由用户补充），用户态与权限预留

## 目录结构

项目将新建独立 Next.js 仓库（旧站不纳入迁移目录）。

```
mywisdompace-next/
├── app/
│   ├── layout.tsx              # [NEW] 全局布局，统一导航/页脚/全站样式入口
│   ├── page.tsx                # [NEW] 首页，承载新版信息架构与视觉升级
│   ├── chapter/
│   │   └── [slug]/page.tsx     # [NEW] 章节页模板，承接目录、阅读进度与工具占位
│   └── (auth)/
│       ├── login/page.tsx      # [RESERVED] 登录页占位
│       └── register/page.tsx   # [RESERVED] 注册页占位
├── components/
│   ├── NavBar.tsx              # [NEW] 顶部导航与移动端菜单
│   ├── Footer.tsx              # [NEW] 底部导航
│   ├── ChapterToc.tsx          # [NEW] 章节目录与滚动定位
│   ├── SearchPanel.tsx         # [NEW] 检索入口与结果展示面板
│   ├── ToolPlaceholder.tsx     # [NEW] 工具占位与状态展示
│   └── AuthEntry.tsx           # [RESERVED] 登录入口/用户态占位
├── data/
│   └── chapters.ts             # [NEW] 章节结构与索引数据（后续内容补充）
├── styles/
│   └── globals.css             # [NEW] Tailwind 全局样式与基础主题变量
└── lib/
    ├── search-index.ts         # [NEW] 检索索引与匹配逻辑
    ├── reading-progress.ts     # [NEW] 阅读进度与持久化封装
    └── auth-placeholder.ts     # [RESERVED] 认证占位逻辑
```

## 关键代码结构（如需）

- 章节数据结构：包含章节标题、分节锚点、摘要、关键词，用于目录与检索构建

## 设计风格

- 参考风格（来自你提供的截图）：轻盈留白、摄影作品集/精选列表感
- 主题定位：温暖人文为底色，赛博只做“点亮式”强调（不做大面积霓虹）
- 版式特征：顶部轻导航（细字重、弱分割线）+ 页面主标题居中 + 次级说明一行文字 + 胶囊筛选（pills）
- 卡片与图片：大圆角（约 16–24px）、柔和投影、卡片网格（2–3 列自适应），图片优先占位，文案克制
- 交互特征：悬停轻抬升（shadow/translate）、筛选 pill 选中态明显、滚动时导航轻粘附与弱阴影增强
- 色彩策略：背景偏浅（暖白/奶油色），强调色用一枚干净的“暖红/珊瑚”或“金色”，赛博色仅用于极小面积（如焦点描边/细线）
- 响应式：移动端主标题与筛选区保持居中与单行可横向滚动；卡片 1 列，搜索与目录用抽屉/浮层

## 页面规划（不超过 5）

1. 首页（信息架构升级、章节入口、工具入口）
2. 章节页模板（章节目录、分节内容、工具占位、阅读进度）
3. 检索结果层（抽屉/浮层）
4. 工具集合页（可选，用于承接未来工具扩展）
5. 章节导航页（可选，用于全局目录与书籍结构）

## 关键区块设计（示例）

- 首页：顶部轻导航 / 居中主标题 + 一行副文案 / 章节（或精选内容）胶囊筛选 pills / 章节入口卡片网格（大圆角、轻投影）/ 工具集合区（同卡片体系）/ footer
- 章节页：顶部轻导航 / 章节 Hero（居中标题）/ 章节目录 pills（可横向滚动）/ 内容分节（锚点不变）/ 工具占位卡（与首页卡片风格一致）/ 阅读进度提示（细线或小标签）/ footer
- 全站检索：导航内搜索入口（按钮或输入框）/ 浮层面板（输入区 + 快捷词/最近浏览）/ 结果列表（按章节分组、支持高亮命中）/ 空状态
- 目录与快捷入口：章节页提供“目录/回到顶部”浮动按钮（右下角），移动端可合并为一个浮动菜单

## Agent Extensions

- **SubAgent: code-explorer**
- Purpose: 深入扫描现有 HTML/CSS/JS 结构与交互逻辑，形成可迁移清单
- Expected outcome: 输出完整的页面结构与交互映射，支撑渐进迁移的准确性