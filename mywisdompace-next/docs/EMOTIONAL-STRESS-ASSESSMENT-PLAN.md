# 心理情绪压力自测 (Emotional Stress Assessment) 迁移与整合计划

## 🎯 最终目标
将基于原生 HTML/Python 的 `emotional-stress-assessment` 工具重构为 React/Next.js (TS) 的现代 Web 应用组件，最终作为**“篇章二：积极生活” (Chapter 2)** 中一个特定的**互动工具入口卡片**，无缝融入 MyWisdompace-Next 的主线体验中。

---

## 📅 项目拆解与里程碑 (Milestones)

### ✅ Phase 1: 数据层与计算引擎移植 (Data & Engine Layer)
- **任务 1.1 定义 TypeScript 类型**
  - 定义 `EmotionQuestion`、`TensionQuestion`、`LifeEvent` 及其关联的答卷 `Answer` 接口。
  - 定义最终的三维综合评估结果 `AssessmentResult` 及五级预警结构。
- **任务 1.2 题库结构化 (Bank Data)**
  - 读取 `references` 目录，将 20题情绪量表（含10道反向）、20题紧张量表（含5道反向）和 65项生活事件（6大类）转化为强类型的 `.ts` 数据结构。
- **任务 1.3 重写核心引擎 (Engine.ts)**
  - 翻译 `calc_engine.py` 的算法逻辑：计算原始分 -> 标准分 (×1.25) -> 各自等级 -> 提取高频风险与反向预警 -> 综合5级矩阵评估。

### ✅ Phase 2: 状态管理与防丢机制 (Store Layer)
- **任务 2.1 创建 Zustand Store**
  - 创建 `useEmotionalAssessmentStore` 存储用户的答题进度：`welcome` -> `emotion` -> `tension` -> `life_events` -> `result`。
  - 集成 `zustand/persist` 以实现答题中途刷新不丢失（利用 localStorage，结合 SSR hydrated 处理）。

### Phase 3: 现代化 UI 与交互开发 (Component Layer)
- **任务 3.1 测试引导页 (WelcomeView)**
  - 免责声明与用语弱化（无医疗诊断效力），测试预估时长提示。
- **任务 3.2 答题流组件 (QuestionFlow)**
  - 支持情绪与紧张模块的 1-4级单选流，带有进度条和过度动画。
- **任务 3.3 事件多选流 (LifeEventsGrid)**
  - 瀑布流/网格布局展示65项生活事件，按家庭、工作、社交等维度折叠或平铺供用户勾选。
- **任务 3.4 结果雷达与报告页 (ResultReport)**
  - 展示情绪/认知/躯体等五维度的图表分析（复用或新增基础图表组件），展示最终的 5 级状态解读和温和建议。

### Phase 4: 路由、入口与篇章整合 (Integration Layer)
- **任务 4.1 创建工具主页**
  - `src/app/tools/emotional-assessment/page.tsx`。
- **任务 4.2 注册工具库**
  - 更新 `src/lib/tools.ts` 和 `src/components/PersonalityTestCards.tsx`，添加对应工具的元信息。
- **任务 4.3 篇章二 (积极生活) 的无缝植入**
  - 修改 `chapter-2` 的页面或 Markdown 结构，在涉及“情绪调节”或“应对压力”的段落末尾，植入该工具的引流卡片（例如 `<ToolContainer toolId="emotional-assessment" />` 或自定义横幅卡片）。

### Phase 5: 验证与打磨 (Validation & Polish)
- 运行 `vitest` 测试核心引擎评分。
- 运行 `npm run lint` 和 `npm run build` 确保类型与构建安全。
- 走查全流程，确保 UI 的“赛博温暖”主题（`bg-[#F5F0E8]` 等色板）一致。

---

## 🛠 关键技术挑战预案
1. **庞大的答题交互疲劳**：情绪20题+紧张20题+事件65项，容易导致用户中途跳出。
   *解决方案*：提供分步的动效反馈、保存进度的 toast 提示，以及生活事件类的直观批量点选模式。
2. **算法矩阵复杂性**：从 `calc_engine.py` 迁移矩阵判断时容易出现越界或边界条件失效。
   *解决方案*：在 `engine.ts` 中构建完后，立刻编写针对性的单元测试（输入极端全 1 分和全 4 分的数据验证边界）。