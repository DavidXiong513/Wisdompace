# ThreeQSA (三思清单) 迁移至 Web 版里程碑规划

> **项目目标**：将 `ThreeQSA` 小程序的深度决策追问逻辑整合至 `MyWisdompace-next` 网站，通过结构化的“三思”模型，帮助用户理清重大人生决策。

---

## 📅 阶段一：决策引擎与题库迁移 (Engine & Bank Migration)
**目标**：将庞大的追问题库结构化，并实现通用的计分与深度判定逻辑。

- [ ] **1.1 题库标准化**
  - 迁移 `question-bank.js` 至 `src/data/three-questions/bank.ts`。
  - 使用 TypeScript 定义严格的题库接口（包含：维度、权重、风险系数）。
- [ ] **1.2 决策逻辑算法**
  - 重构 `calculateScore` 函数，处理加权平均分及风险等级判定。
  - 实现基于维度的结果解读逻辑（价值观得分 vs 现实预期得分）。
- [ ] **1.3 状态管理 (Zustand)**
  - 创建 `src/stores/useThreeQuestionsStore.ts`。
  - 支持多决策并行（即用户可以同时保存“职业选择”和“生育选择”两个不同的三思记录）。

## 🎨 阶段二：UI 交互重构 (UI Refactoring)
**目标**：复刻小程序中“引导式问答”的沉浸感，并针对网页端优化长表单体验。

- [ ] **2.1 沉浸式问答流**
  - 使用 React 动画（如 Framer Motion）复刻“一问一答”的切换效果。
  - 设计顶部进度条，展示当前决策的“思考深度”。
- [ ] **2.2 决策场景选择器**
  - 优化 `life-entry` 的入口设计，使用卡片式布局展示不同场景（医疗、职业、家庭等）。
- [ ] **2.3 动态结果报告**
  - 开发 `DecisionReport` 组件：包含雷达图（展示维度均衡性）和文字总结。
  - 提供“导出决策书”功能（PDF/Markdown）。

## 🔗 阶段三：全站集成与导航接入
**目标**：将三思清单作为核心工具集成到网站的篇章渲染中。

- [ ] **3.1 工具注册**
  - 在 `src/lib/tools.ts` 中注册 `three-questions-tool`。
  - 在 `src/app/tools/three-questions/` 下创建统一入口。
- [ ] **3.2 章节锚点打通**
  - 确保该工具能被 `/chapter/chapter-2#how-to-live` (积极生活) 等相关内容正确调用。
- [ ] **3.3 历史记录持久化**
  - 利用 Supabase 存储用户的决策记录，确保跨设备可查。

## 🛡️ 阶段四：内容安全与优化
**目标**：保障决策隐私，优化加载速度。

- [ ] **4.1 隐私保障**
  - 确保用户的决策回答在传输过程中全加密，并支持一键擦除历史记录。
- [ ] **4.2 数据量优化**
  - 针对庞大的题库文件（40KB+），采用动态按需加载（Code Splitting），只有当用户进入特定场景时才加载对应题库。
- [ ] **4.3 自动化测试**
  - 编写不同回答组合的测试用例，验证计分逻辑的鲁棒性。

---

## 🚀 预计交付顺序
1. `src/data/three-questions/bank.ts` (标准化题库)
2. `src/lib/three-questions/engine.ts` (核心算法)
3. `src/components/three-questions/QuestionFlow.tsx` (交互组件)
4. `src/app/tools/three-questions/page.tsx` (场景入口)

---
*文档生成日期：2026-04-13*
*关联项目：ThreeQSA (WeChat Mini Program)*
