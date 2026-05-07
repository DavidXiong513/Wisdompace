# 【三思清单】Web 迁移工程接力说明书

> 目的：将 `ThreeQSA` 小程序的深度决策追问逻辑完整迁移至 Web 站。
> 核心挑战：庞大的分类题库管理、多维度加权算法、沉浸式问答流体验。

## 1. 目录结构规范
- **类型定义**: `src/types/three-questions.ts` (定义决策模型)
- **题库数据**: `src/data/three-questions/bank.ts` (标准化追问题库)
- **计算逻辑**: `src/lib/three-questions/engine.ts` (多维度评分引擎)
- **状态管理**: `src/stores/threeQuestionsStore.ts` (Zustand 状态，支持多决策存储)
- **交互组件**: `src/components/tools/three-questions/` (场景选择、问答卡片、分析雷达)
- **页面入口**: `src/app/tools/three-questions/page.tsx`

## 2. 开发进度追踪 (Checklist)
- [x] **Step 1: 类型定义** (Status: Done)
- [x] **Step 2: 题库标准化迁移** (Status: Done - `src/data/three-questions/bank.ts`)
- [x] **Step 3: 评分引擎实现** (Status: Done - `src/lib/three-questions/engine.ts`)
- [x] **Step 4: Zustand Store 建立** (Status: Done - `src/stores/threeQuestionsStore.ts`)
- [x] **Step 5: 沉浸式问答流 UI** (Status: Done - `ScenarioSelector.tsx`, `QuestionFlow.tsx`)
- [x] **Step 6: 决策分析报告与导出** (Status: Done - `DecisionReport.tsx` with Radar Chart & MD Export)

## 3. 核心评估维度参考
- **价值观维度**: 决策是否符合内心底层信念。
- **心理预期维度**: 是否做好了最坏结果的心理建设。
- **稀缺性维度**: 该选择是否具有不可替代性或时间紧迫性。

---
*后续 AI 接手后，请优先处理题库的 TS 化迁移。*
