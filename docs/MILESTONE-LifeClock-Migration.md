# LifeClock (生命余光) 迁移至 Web 版里程碑规划

> **项目目标**：将原有的 `LifeClockD` 微信小程序逻辑与视觉体验完整迁移至 `MyWisdompace-next` 网站，打造一个沉浸式的“生命倒计时与健康评估”工具。

---

## 📅 阶段一：逻辑层迁移 (Logic Migration)
**目标**：将小程序原生 JS 逻辑转化为类型安全的 TypeScript 逻辑，并接入 Zustand 状态管理。

- [ ] **1.1 计算引擎重构**
  - 迁移 `calculateLifeExpectancy` 核心算法至 `src/lib/life-clock/engine.ts`。
  - 包含：BMI 计算、生活方式加减分、状态系数调节。
- [ ] **1.2 状态管理 (Zustand Store)**
  - 创建 `src/stores/useLifeClockStore.ts`。
  - 实现持久化存储（LocalStorage），保存用户的出生日期、生活习惯等输入。
- [ ] **1.3 倒计时算法适配**
  - 编写高性能的 `useCountdown` Hook，确保 Web 端倒计时平滑且不抖动。

## 🎨 阶段二：UI 组件重构 (UI Refactoring)
**目标**：利用 Tailwind CSS 4 和 shadcn/ui 复刻并升级小程序的视觉体验。

- [ ] **2.1 多步骤表单开发**
  - 第一步：基础信息 (出生日期、身高体重)。
  - 第二步：健康背景 (家族史、遗传病)。
  - 第三步：生活方式 (滑动条控制：作息、饮食、情绪)。
  - 第四步：行为习惯 (多选：熬夜、烟、酒)。
- [ ] **2.2 核心视觉组件**
  - **生命钟 (Clock Canvas)**：使用 CSS 动画或 Canvas 渲染动态倒计时。
  - **生命月格图 (Month Grid)**：复刻小程序中的方格视图，展示已消耗与剩余生命。
- [ ] **2.3 响应式适配**
  - 针对桌面端进行大屏优化，增强沉浸式体验（如增加背景氛围感）。

## 🔗 阶段三：功能集成与页面上线
**目标**：将工具正式集成到网站的 `[slug]` 渲染系统和导航中。

- [ ] **3.1 路由配置**
  - 在 `src/app/tools/life-clock/page.tsx` 创建主页面。
  - 在 `src/lib/tools.ts` 中注册工具，状态设为 `ready`。
- [ ] **3.2 渲染链路打通**
  - 确保该工具可以通过 `/chapter/read-instructions#preparedness` 等锚点或直接通过工具页访问。
- [ ] **3.3 结果分享功能**
  - 实现测评报告的图片生成或链接分享功能。

## 🛡️ 阶段四：安全性与性能优化
**目标**：保障隐私，优化加载。

- [ ] **4.1 数据隐私**
  - 严格确保用户输入的生理数据仅保存在本地或加密同步，不进行敏感信息明文传输。
- [ ] **4.2 性能调优**
  - 优化月格图（近千个 DOM 节点）的渲染性能，防止低配设备卡顿。
- [ ] **4.3 自动化测试**
  - 编写计算引擎的单元测试，确保加减分逻辑 100% 准确。

---

## 🚀 预计交付顺序
1. `src/lib/life-clock/engine.ts` (核心算法)
2. `src/stores/useLifeClockStore.ts` (状态管理)
3. `src/components/life-clock/*` (视觉组件)
4. `src/app/tools/life-clock/page.tsx` (最终整合)

---
*文档生成日期：2026-04-13*
*关联项目：LifeClockD (WeChat Mini Program)*
