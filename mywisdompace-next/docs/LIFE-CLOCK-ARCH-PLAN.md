# 【生命余光】Web 迁移工程接力说明书

> 目的：将 `LifeClockD` 小程序完整迁移至 Web 站。
> 架构原则：逻辑引擎独立、状态持久化、UI 组件模块化。

## 1. 目录结构规范
- **类型定义**: `src/types/life-clock.ts` (定义业务接口)
- **计算逻辑**: `src/lib/life-clock/engine.ts` (寿命计算公式，不含 UI)
- **状态管理**: `src/stores/lifeClockStore.ts` (Zustand 状态与持久化)
- **交互组件**: `src/components/tools/life-clock/` (表单、生命钟、方格图)
- **页面入口**: `src/app/tools/life-clock/page.tsx`

## 2. 开发进度追踪 (Checklist)
- [x] **Step 1: 类型定义** (Status: Done)
- [x] **Step 2: 计算引擎重构** (Status: Done - `src/lib/life-clock/engine.ts`)
- [x] **Step 3: Zustand Store 建立** (Status: Done - `src/stores/lifeClockStore.ts`)
- [x] **Step 4: 基础录入表单 UI** (Status: Done - `src/components/tools/life-clock/LifeClockForm.tsx`)
- [x] **Step 5: 生命钟/方格图视觉开发** (Status: Done - `LifeCountdown.tsx`, `LifeMonthGrid.tsx`)
- [ ] **Step 6: 结果页面与分享功能** (Status: Writing...)

## 3. 核心计算逻辑参考 (源从小程序)
- 基础寿命: `78.6`
- 影响因子: BMI、家族病史、作息、饮食、情绪、运动、烟酒。
- 状态系数: 乐观(1.0), 忧虑(0.92)。

---
*请后续 AI 接手后，先阅读 `src/types/life-clock.ts` 了解数据模型。*
