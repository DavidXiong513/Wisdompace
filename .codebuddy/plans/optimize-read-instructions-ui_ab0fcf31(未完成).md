---
name: optimize-read-instructions-ui
overview: 为 chapter/read-instructions 页面制定视觉与交互优化计划，覆盖布局、导航、层级、交互、响应式与信息精简要求。
design:
  architecture:
    framework: react
  styleKeywords:
    - 温暖柔和
    - 卡片层次
    - 轻量动效
    - 清晰排版
  fontSystem:
    fontFamily: Noto Sans
    heading:
      size: 28px
      weight: 600
    subheading:
      size: 20px
      weight: 500
    body:
      size: 15px
      weight: 400
  colorSystem:
    primary:
      - "#E8C872"
      - "#3D2B1F"
    background:
      - "#F6E9D2"
      - "#FAF7F1"
    text:
      - "#2F2A24"
      - "#6A6256"
    functional:
      - "#E8D4B8"
      - "#C7A96A"
todos:
  - id: explore-scope
    content: 使用 [subagent:code-explorer] 复核章节页与导航相关组件
    status: pending
  - id: layout-typography
    content: 调整 read-instructions 布局、行宽、卡片内边距与标题层级
    status: pending
    dependencies:
      - explore-scope
  - id: nav-interaction
    content: 优化顶部与侧边导航高亮、hover、英文标签隐藏与移动折叠
    status: pending
    dependencies:
      - explore-scope
  - id: interaction-effects
    content: 新增回到顶部按钮与卡片/按钮动效（使用 [skill:tailwind-css]）
    status: pending
    dependencies:
      - layout-typography
  - id: content-refine
    content: 拆分正文长段落并补充关键词高亮与分段
    status: pending
    dependencies:
      - layout-typography
  - id: responsive-verify
    content: 校验平板/手机响应式展示并微调细节
    status: pending
    dependencies:
      - nav-interaction
      - interaction-effects
---

## User Requirements

- 优化 chapter/read-instructions 子页的布局、导航、视觉层级与交互体验，提升美观与可读性
- 保持“温暖、柔和”的米黄+深棕氛围，卡片背景清爽且文字易读
- 兼顾 PC 与移动端展示，侧边导航在小屏需可折叠/替代
- 情感化设计：卡片内增加温暖插画或图标，减轻话题沉重感
- 微交互细节：章节跳转采用平滑滚动
- 信任感营造：页面底部加入社会认同文案（如“已帮助 XX 位用户完成整理”）

## Product Overview

- 单页阅读指引页面的视觉与交互优化方案，包含版式、层级、导航、动效与响应式适配

## Core Features

- 主内容区行宽收敛、卡片间距与内边距优化，阅读更舒适
- 顶部导航与侧边导航加入当前位置高亮与悬停效果，移动端导航可折叠
- 标题层级与段落分段/重点高亮，卡片加入细腻阴影与 hover 动效
- 增加滚动后出现的“回到顶部”浮动按钮，交互平滑过渡
- 卡片加入温暖插画或图标，形成情感缓冲
- 章节跳转采用平滑滚动，提升衔接感
- 页面底部加入社会认同元素，增强信任感

## Tech Stack Selection

- 前端框架：Next.js（React）+ TypeScript（沿用现有）
- 样式方案：Tailwind CSS（沿用现有）

## Implementation Approach

- 以现有页面结构为基础，新增轻量客户端组件处理滚动状态、侧边导航高亮与移动端折叠
- 通过 Tailwind 原子类调整布局尺寸、行宽、间距与过渡，避免引入新样式体系
- 复用现有 IntersectionObserver 逻辑思路（参考 ChapterToc），保证滚动高亮性能与稳定性
- 性能：IntersectionObserver O(n) 监听段落，滚动按钮仅在超过一屏显示，避免频繁重排

## Implementation Notes

- 侧边导航高亮使用 `scroll-mt` 与 Observer 同步，避免与锚点跳转冲突
- 章节锚点跳转启用 `scroll-behavior: smooth`，保证滚动与高亮一致
- 社会认同文案置于页面底部主内容区内，样式轻量且不喧宾夺主
- 保持现有背景层与卡片结构，不做大范围重构，降低回归风险
- 统一所有可点击元素加入 `transition duration-300`，避免过度动画导致视觉噪音

## Phase Plan (按优先级与难度)

- 阶段一（高价值、低风险）：布局与排版调整、标题层级、卡片间距、正文分段与关键词高亮
- 阶段二（高价值、中难度）：顶部/侧边导航高亮与 hover、英文标签移动端隐藏、平滑滚动
- 阶段三（中价值、中难度）：回到顶部按钮、卡片微动效、可点击元素统一过渡
- 阶段四（中价值、可选）：温暖插画/图标点缀、底部社会认同元素、移动端导航折叠细节完善

## Architecture Design

- 页面仍为 server component，新增独立 client component 承担交互逻辑
- 组件关系：ReadInstructionsPage → ReadInstructionsToc（侧边/移动导航） + ScrollTopButton

## Directory Structure

```
mywisdompace-next/
├── src/app/chapter/read-instructions/page.tsx  # [MODIFY] 调整布局、排版、卡片样式与正文分段；接入新交互组件；优化响应式排版与行宽
├── src/components/ChapterTopNav.tsx            # [MODIFY] 当前章节高亮样式；英文标签在 <768px 隐藏；导航交互过渡
├── src/components/ReadInstructionsToc.tsx      # [NEW] 客户端侧边导航组件；滚动高亮与移动端折叠菜单逻辑
└── src/components/ScrollTopButton.tsx          # [NEW] 回到顶部浮动按钮；滚动阈值控制显示与平滑过渡
```

- 设计风格：温暖柔和的米黄底 + 深棕文字，卡片留白充足，层次清晰  
- 版式结构：主内容区宽度控制在 600-800px，侧边栏紧凑，减少横向浪费  
- 交互体验：导航高亮与 hover 反馈明显，按钮与卡片有轻微动效  
- 响应式：桌面保留侧边目录，小屏折叠为汉堡按钮或抽屉式目录  
- 视觉细节：柔和阴影、细微渐变与纹理，避免空旷和单调

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 复核章节页相关组件与样式引用范围，避免遗漏影响面
- Expected outcome: 明确涉及的文件清单与交互关联点，减少返工

### Skill

- **tailwind-css**
- Purpose: 输出更高效的 Tailwind 组合方案（排版、动效、响应式）
- Expected outcome: 形成可直接落地的 class 组合清单与优化建议