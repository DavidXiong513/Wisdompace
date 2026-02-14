---
name: 网站开发路线图
overview: 规划网站后续开发的阶段、任务清单和执行顺序，涵盖内容搭建、功能实现与最终审查。
todos:
  - id: define-chapter-data
    content: 在 `data/chapters.ts` 中定义章节内容的数据结构并填充基础数据。
    status: pending
  - id: implement-chapter-template
    content: 创建动态章节页面模板 `app/chapter/[slug]/page.tsx` 并实现内容与目录渲染。
    status: pending
    dependencies:
      - define-chapter-data
  - id: implement-search
    content: 开发全站搜索组件 `SearchPanel.tsx` 及 `lib/search.ts` 中的索引查询逻辑。
    status: pending
    dependencies:
      - define-chapter-data
  - id: implement-auth-pages
    content: 创建用户登录与注册的占位页面及 `AuthEntry.tsx` 入口组件。
    status: pending
  - id: update-navigation
    content: 更新 `Footer.tsx` 组件，将导航链接指向已创建的章节和认证页面。
    status: pending
    dependencies:
      - implement-chapter-template
      - implement-auth-pages
---

## 产品概述

本项目旨在为《一生的整理》网站进行下一阶段的功能开发，在现有主页基础上，丰富内容页面、增强网站功能性与导航能力。

## 核心功能

- **章节页面实现**：设计并实现“阅读说明”及“Chapter 1-4”共五个子页面，作为网站的核心内容载体。
- **全站搜索功能**：在网站中集成全局搜索功能，允许用户快速查找所有章节内的内容。
- **用户认证体系**：构建用户登录与注册的基础功能页面，为未来的个性化服务提供入口。
- **导航链接完善**：激活并正确链接所有导航元素，特别是底部导航栏，确保站点内部流转顺畅。

## 技术栈选择

- **框架**: Next.js (App Router)
- **UI 库**: React + TypeScript
- **样式**: Tailwind CSS
- **数据**: 本地静态 TypeScript/JSON 文件

## 实现方法

项目将延续现有 `mywisdompace-next` 的技术架构。开发将围绕数据结构定义、动态页面模板构建、功能组件开发和导航链接更新四个核心环节展开。首先定义承载网站内容的标准化数据结构，然后基于此结构创建可复用的章节页面模板。随后，独立开发搜索和认证等功能模块。最后，更新全局导航组件，将所有新建页面无缝整合到站点中。

## 目录结构

后续开发将主要在 `mywisdompace-next/` 目录下进行，涉及以下文件的创建与修改：

```
mywisdompace-next/
├── app/
│   ├── chapter/
│   │   └── [slug]/
│   │       └── page.tsx        # [NEW] 动态章节页面模板，用于展示所有章节内容。
│   └── (auth)/
│       ├── login/
│       │   └── page.tsx        # [NEW] 用户登录页面。
│       └── register/
│           └── page.tsx        # [NEW] 用户注册页面。
├── components/
│   ├── Footer.tsx              # [MODIFY] 修改底部导航，链接到新的章节和认证页面。
│   ├── SearchPanel.tsx         # [NEW] 全站搜索面板组件，包含输入框和结果展示区。
│   ├── ChapterToc.tsx          # [NEW] 章节目录组件，用于在章节页内部导航。
│   └── AuthEntry.tsx           # [NEW] 导航栏上的登录/注册入口组件。
├── data/
│   └── chapters.ts             # [NEW] 存储所有章节标题、路径、内容的静态数据文件。
└── lib/
    └── search.ts               # [NEW] 包含搜索索引构建和查询逻辑的工具函数。
```