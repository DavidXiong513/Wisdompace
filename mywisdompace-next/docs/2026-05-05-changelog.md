# 2026-05-05 变更记录

> 本文档记录 2026-05-05 当日所有代码变更，作为 Git 存档的配套文档。

---

## 一、about-simon 页面优化

### 1.1 时间线增加年份范围
**文件**: `src/app/about-simon/page.tsx`
**变更**: TIMELINE 数据全部补充了起止年份

| 阶段 | 年份 |
|------|------|
| 培训师起步 | 2006-2010 |
| 合资纵深 | 2010-2013 |
| 外企深耕 | 2013-2017 |
| 创业历练 | 2017-2020 |
| 互联网大厂 | 2020-2021 |
| 酒旅龙头 | 2021-2023 |
| 乙方创业 | 2023-至今 |

### 1.2 四阶模型 Step 3 更新为「积极生活」
**文件**: `src/app/about-simon/philosophy/page.tsx`
**变更**:
- 标题: 借假修真 → 积极生活
- 副标题: Practice & Truth → Active Living
- 描述: 从哲学化改版为"工作家庭平衡+三大兴趣+成就感/成长感"
- 方法标签: 工作生活平衡 / 体能兴趣 / 智力兴趣 / 创作兴趣 / 持续成长
- 方法论卡片（借假修真）已回退，保持原样

---

## 二、Supabase / 认证测试

### 2.1 创建 middleware.ts
**文件**: `src/middleware.ts`（新增）
**变更**: 调用 `updateSession` 刷新 Supabase Auth token cookie

### 2.2 认证 API 错误提示改善
**文件**: `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`
**变更**: 增加 "fetch failed" / "NetworkError" 的中文友好提示

### 2.3 测试连接 API 调整
**文件**: `src/app/api/test-supabase/route.ts`
**变更**: 更新测试逻辑

---

## 三、思考题回答框功能

### 3.1 新增 reflection-answer category
**文件**: `src/lib/validations/progress.ts`, `src/types/database.ts`
**变更**: 扩展 `ProgressCategoryEnum`，新增 `'reflection-answer'`

### 3.2 新增 useReflectionAnswers Hook
**文件**: `src/hooks/useReflectionAnswers.ts`（新增）
**功能**: 本地存储 + API 同步 + 800ms 防抖保存 + 状态管理
- 未登录用户 → localStorage 本地保存
- 已登录用户 → localStorage 缓存 + 防抖同步到 Supabase
- 已添加 `'use no memo'` 指令

### 3.3 新增 ReflectionAnswerBox 组件
**文件**: `src/components/chapter/ReflectionAnswerBox.tsx`（新增）
**功能**: textarea + 字数统计 + 保存状态提示 + 登录提示
- 保存状态显示：保存中… / 已同步到云端 ✓ / 已保存到本地 ✓ / 同步失败
- 未登录用户输入时显示小标签「登录后可云端保存」

### 3.4 ChapterReader 集成回答框
**文件**: `src/components/chapter/ChapterReader.tsx`
**变更**: 每道思考题下方嵌入 ReflectionAnswerBox，题目卡片改为垂直布局

---

## 四、能力兴趣自评 (ability-test) 持久化与同步

### 4.1 ability-store 云端同步改造
**文件**: `src/lib/ability-store.ts`
**变更**:
- 新增 `lastUpdated` 字段，用于本地/云端状态合并时判断新旧
- 引入 `syncToolState` / `fetchToolState`，接入共用同步机制
- `setPhase`、`setCurrentIndex`、`setAnswer`、`setLastCompletedBatch` 变更时自动防抖同步（1.5s）
- `persist` 配置新增 `onRehydrateStorage`，hydration 完成后自动拉取云端最新并合并
- `reset` 时重置 `lastUpdated`
- 修复 `setLastCompletedBatch` 参数类型为 `number | null`

### 4.2 ability-test 页面改造
**文件**: `src/app/tools/ability-test/page.tsx`
**变更**:
- 修复恢复进度提示逻辑：`phase === 'welcome' && hasProgress` 时显示黄色提示条
- ReportPage 新增结果自动保存（已登录用户保存到 `assessments` 表）
- 报告头下方显示云端保存状态

---

## 五、修复：所有测评工具卡在"加载中"

### 5.1 重写 usePersistHydrated
**文件**: `src/lib/hooks/usePersistHydrated.ts`
**变更**:
- 弃用 `useSyncExternalStore`，改用 `useState` + `useEffect`
- SSR 时直接返回 `false`
- 客户端首次渲染时检查 `hasHydrated()`
- 订阅 `onFinishHydration`，hydration 完成后自动更新
- 添加 3 秒超时回退
- 添加 `'use no memo'` 指令

### 5.2 React Compiler 兼容性修复
**文件**:
- `src/hooks/useReflectionAnswers.ts` — 添加 `'use no memo'`
- `src/components/tools/emotional-assessment/QuestionFlow.tsx` — 添加 `'use no memo'`

### 5.3 数据加载错误处理
**文件**:
- `src/app/tools/mbti-test/page.tsx` — `loadAllMBTIData` 添加 `.catch()`
- `src/app/tools/big-five-test/page.tsx` — `loadAllBigFiveData` 添加 `.catch()`

### 5.4 MBTI / 大五 Store 云端同步改造
**文件**: `src/stores/testStore.ts`, `src/lib/big-five-store.ts`
**变更**: 类似 ability-store，新增云端同步机制

### 5.5 新增同步工具模块
**文件**: `src/lib/sync-tool-state.ts`, `src/lib/sync.ts`, `src/hooks/useCloudSync.ts`, `src/hooks/useChapterReadingProgress.ts`（新增）

---

## 六、生涯价值观测评 (career-values-test) 审查与修复

**文件**: `src/app/tools/career-values-test/page.tsx`

| 修复项 | 说明 |
|--------|------|
| 添加 `'use no memo'` | React Compiler 兼容性，防止 Zustand selector 被不当优化 |
| 数字标注修正 | "已阅读 X/15" → "已阅读 X/14" |
| 数字标注修正 | "15 → 8（被排除的7个）" → "14 → 8（被排除的6个）" |
| XSS 修复 | `highlightSentence` 先转义 HTML 特殊字符（& < > " '），再做价值观名称高亮替换 |

---

## 七、其他变更

### 7.1 章节数据更新
**文件**: `src/data/chapters.ts`
**变更**: 内容微调

### 7.2 工具注册表更新
**文件**: `src/lib/tools.ts`
**变更**: 工具状态更新

### 7.3 CI keep-alive
**文件**: `mywisdompace-next/.github/workflows/keep-alive.yml`（新增）
**变更**: 防止 Supabase 项目休眠

---

## 变更统计

| 类别 | 修改文件 | 新增文件 |
|------|---------|---------|
| about-simon 优化 | 1 | 0 |
| 认证测试 | 3 | 1 |
| 思考题回答框 | 2 | 2 |
| 能力兴趣同步 | 2 | 0 |
| 加载卡住修复 | 5 | 0 |
| MBTI/大五同步 | 2 | 4 |
| 生涯价值观修复 | 1 | 0 |
| 其他 | 2 | 1 |
| **合计** | **18** | **8** |

> 变更行数: +573 / -106
