# MyWisdompace-next Bug 修复阶段工作报告

> 日期：2026-04-12  
> 负责人：Codex  
> 目的：记录本轮阶段性 Bug 排查与修复进展，供后续 Gemini 继续接手

---

## 1. 本轮工作的目标

本轮工作的目标不是一次性修完整个站点，而是先完成以下三件事：

1. 熟悉 `MyWisdompace-next` 当前真实升级状态，而不是只参考旧路线图。
2. 跑出现有工程门禁问题，区分“代码问题”和“环境/沙箱问题”。
3. 先修复一批明确、可复现、会阻断 `lint` 的问题，尤其是测评页中的 React Hooks 问题。

本轮采用的是“先证据、后修复”的方式推进，先运行检查，再做最小修复，不做顺手大改。

---

## 2. 对项目当前状态的判断

### 2.1 升级进度判断

`MyWisdompace-next` 的实际升级进度，明显高于根目录那份旧版 `ROADMAP-Upgrade-Milestones.md` 所呈现的状态。

从代码和 `docs` 可以确认：

- 工程化基础已经落地：
  - `Vitest`
  - `Playwright`
  - `ESLint`
  - `Prettier`
  - `husky`
  - `.github` 工作流
- 后端骨架已经落地：
  - `Supabase client/server/middleware`
  - `auth` 路由
  - `assessments` 路由
  - `progress` 路由
  - `conversations` 路由
  - `zod` 校验
  - `TanStack Query hooks`
- 章节页、搜索页、登录注册页、若干测评页已经存在并可读。

### 2.2 当前项目的主要问题类型

当前问题大致可以分成两类：

#### A. 工程门禁类问题

这类问题会直接阻塞 `eslint` 或后续 CI：

- `no-explicit-any`
- `react-hooks/set-state-in-effect`
- 未使用变量 / 未使用导入
- 测评页里依赖 `persist` hydration 的客户端渲染残留写法

#### B. 内容迁移/页面完整性问题

这类问题不一定会阻塞构建，但会影响站点质量：

- `chapter-2`、`chapter-3`、`chapter-4` 头部内容存在明显复制痕迹
- 文档状态与真实代码状态不同步
- 个别组件/页面仍保留占位式或过渡式实现

本轮主要处理了 A 类问题中的一部分，尤其是 `ability-test` 页面。

---

## 3. 本轮实际运行过的检查

### 3.1 已运行命令

在 `D:\AICode\MyWisdompace\MyWisdompace-next` 下运行过：

```bash
cmd /c npm run lint
cmd /c npm run test
cmd /c npm run build
cmd /c npx eslint src\app\tools\ability-test\page.tsx
```

### 3.2 命令结果

#### `cmd /c npm run lint`

成功启动，并给出了真实代码问题。主要错误集中在：

- `src/app/api/progress/route.ts`
- `src/app/api/test-scoring/route.ts`
- `src/app/tools/mbti-test/page.tsx`
- `src/app/tools/ability-test/page.tsx`
- `src/app/tools/career-values-test/page.tsx`

#### `cmd /c npm run test`

未拿到有效项目测试结果，受沙箱环境影响，报错为：

- `failed to load config from vitest.config.ts`
- `spawn EPERM`

这更像当前执行环境限制，不足以直接判断项目测试本身是否失败。

#### `cmd /c npm run build`

编译阶段能走到：

- `Compiled successfully`
- `Running TypeScript ...`

但随后同样被环境问题打断，报错：

- `spawn EPERM`

因此本轮不能据此认定构建逻辑本身有业务级失败。

#### `cmd /c npx eslint src\app\tools\ability-test\page.tsx`

本命令已在本轮修复后重新执行，结果为：

- 退出码 `0`
- 无输出

这意味着 `ability-test/page.tsx` 当前已经通过单文件 lint。

---

## 4. 本轮已完成的代码修复

### 4.1 `src/app/api/progress/route.ts`

#### 问题

原实现中存在：

- `as any`

这会触发：

- `@typescript-eslint/no-explicit-any`

#### 修复

将 upsert 的载荷显式收敛为：

```ts
Database['public']['Tables']['progress']['Insert']
```

#### 当前收益

- 消除一个真实的 `any`
- 让该 API 路由的 insert/upsert 更贴近数据库类型定义

---

### 4.2 `src/app/api/test-scoring/route.ts`

#### 问题

原实现中测试结果数组为：

```ts
const results: any[] = [];
```

#### 修复

新增了明确的结果类型：

```ts
type TestCaseResult = {
  test: string;
  input: unknown;
  output: unknown;
  expected: string;
  passed: boolean;
};
```

并将数组改为：

```ts
const results: TestCaseResult[] = [];
```

#### 当前收益

- 消除一个真实的 `any`
- 让该测试接口的返回结构更清晰

---

### 4.3 `src/app/tools/mbti-test/page.tsx`

#### 原始问题

该页存在典型的：

- `useEffect` 中同步 `setPhase`

这会触发：

- `react-hooks/set-state-in-effect`

同时还带有一些未使用的 props / store 字段。

#### 修复方式

没有继续在 effect 中驱动 `phase`，而是改成派生值：

```ts
const effectivePhase = !loading && Object.keys(answers).length > 0 && phase === 'welcome'
  ? 'testing'
  : phase;
```

并用 `effectivePhase` 控制渲染分支。

同时移除了未使用的：

- `QUESTIONS_PER_PAGE`
- `isPageComplete`
- `allQuestions`
- 对应 props 中的多余字段

#### 当前状态

- 代码已修改
- 但本轮尚未单独重新跑 `mbti-test/page.tsx` 的单文件 lint
- 它属于“已修但未二次验证完成”的状态

---

### 4.4 `src/app/tools/ability-test/page.tsx`

这是本轮收尾最完整的一页。

#### 原始问题

该页原本至少存在以下几类问题：

1. `alerts` 通过 `useEffect + setState` 同步生成
2. `report` 通过 `useEffect + setState` 同步生成
3. 页面底部保留 `mounted / setMounted / handleResume` 旧逻辑
4. 存在不再需要的导入和类型

#### 修复内容

##### A. `alerts` 改为派生值

原先：

- `useEffect(...)`
- `setAlerts(...)`

现改为：

```ts
const alerts = useMemo(
  () => (ability && currentAnswer?.p ? checkAlerts(ability, answers) : []),
  [ability, currentAnswer?.p, answers]
);
```

##### B. `report` 改为派生值

原先：

- `const [report, setReport] = useState(...)`
- `useEffect(() => setReport(generateReport(answers)))`

现改为：

```ts
const report = useMemo(() => generateReport(answers), [answers]);
```

##### C. hydration 逻辑收敛

新增了通用 hook：

- [usePersistHydrated.ts](D:\AICode\MyWisdompace\MyWisdompace-next\src\lib\hooks\usePersistHydrated.ts)

页面底部改为：

```ts
const hydrated = usePersistHydrated(useAbilityStore);

if (!hydrated) {
  return <loading />;
}
```

替代了旧的：

- `mounted`
- `setMounted`
- 空壳 `handleResume`

##### D. 清理无用导入/类型

移除了不再需要的：

- `useEffect`
- `useCallback`
- `AbilityAlert`
- `AbilityReport`

#### 验证结果

已运行：

```bash
cmd /c npx eslint src\app\tools\ability-test\page.tsx
```

结果：

- 退出码 `0`
- 无报错

#### 当前状态

- `ability-test/page.tsx` 可以认为本轮已经完整收尾

---

## 5. 本轮新增文件

### `src/lib/hooks/usePersistHydrated.ts`

#### 作用

为使用 Zustand `persist` 的页面提供统一的 hydration 状态判断，避免每个页面都用：

- `mounted`
- `setMounted(true)`
- 客户端空跑 `useEffect`

#### 当前价值

这个 hook 已经在 `ability-test` 中接入成功，后续建议复用到：

- `career-values-test`
- 其他依赖 persist 的测评页

---

## 6. 当前工作区状态

截至本报告生成时，`git status --short` 为：

```bash
M src/app/api/progress/route.ts
M src/app/api/test-scoring/route.ts
M src/app/tools/ability-test/page.tsx
M src/app/tools/mbti-test/page.tsx
?? src/lib/hooks/usePersistHydrated.ts
```

说明：

- 本轮修改尚未提交
- `career-values-test/page.tsx` 还没有进入正式修复

---

## 7. 当前未完成项

### 7.1 `career-values-test/page.tsx`

这是下一步最应该接手的文件。

根据本轮第一次全量 `lint` 结果，它至少存在：

- `useEffect` 中同步 `setReport`
- `useEffect` 中同步 `setMounted(true)`
- 可能还伴随未使用变量/导入

非常适合直接复用 `ability-test` 这次的修法：

- 派生值替代 `setState in effect`
- `usePersistHydrated` 替代 `mounted`
- 清理未使用导入/常量

### 7.2 `mbti-test/page.tsx`

这页本轮已改，但尚未单独验证通过。

建议 Gemini 接手时做一次：

```bash
cmd /c npx eslint src\app\tools\mbti-test\page.tsx
```

如果仍有报错，再做微调。

### 7.3 全量 `lint`

本轮没有在最后重新跑一次全量：

```bash
cmd /c npm run lint
```

因为策略上先聚焦到 `ability-test` 收尾。

后续在处理完 `career-values-test` 和必要的 `mbti-test` 收尾后，应再跑全量 lint。

### 7.4 `test` / `build`

当前仍未拿到有效的最终结论，原因是执行环境里出现：

- `spawn EPERM`

Gemini 接手时需要区分：

1. 这是沙箱/权限问题
2. 还是项目本身配置问题

不要直接把这两项判成“项目构建失败”。

### 7.5 章节内容重复问题

本轮已观察到：

- `chapter-2`
- `chapter-3`
- `chapter-4`

存在明显的头部内容复制痕迹。

这不是当前最优先的工程门禁问题，但属于明确的内容质量问题，后续应安排单独处理。

---

## 8. 建议 Gemini 的下一步顺序

推荐按下面顺序继续：

1. 先修 [page.tsx](D:\AICode\MyWisdompace\MyWisdompace-next\src\app\tools\career-values-test\page.tsx)
2. 再单独验证 [page.tsx](D:\AICode\MyWisdompace\MyWisdompace-next\src\app\tools\mbti-test\page.tsx)
3. 运行全量 `cmd /c npm run lint`
4. 再看是否需要处理 `test` / `build` 的 `spawn EPERM`
5. 最后再回头处理章节内容重复问题

---

## 9. 给 Gemini 的接手提示

### 已经可以直接参考的实现

如果要继续修 `career-values-test`，可以直接参考：

- [page.tsx](D:\AICode\MyWisdompace\MyWisdompace-next\src\app\tools\ability-test\page.tsx)
- [usePersistHydrated.ts](D:\AICode\MyWisdompace\MyWisdompace-next\src\lib\hooks\usePersistHydrated.ts)

### 不要重复做的事

- 不需要再重新分析整个项目升级状态
- 不需要再回到根目录旧路线图做“当前是 0% 进度”的判断
- `ability-test` 已经完成单文件 lint 验证，不需要从头再修

### 需要特别注意的事

- 当前仓库存在未提交改动，继续修改时不要覆盖本轮已完成的 `ability-test` 收尾
- `test/build` 的 `EPERM` 很可能与执行环境有关，不要直接误判为业务失败

---

## 10. 本轮结论

这轮工作已经完成了一个明确的阶段目标：

- 成功把 `ability-test` 从“半完成状态”收尾到“单文件 lint 通过”
- 同时修掉了两个 API 路由中的显式 `any`
- 并为后续同类页面抽出了一个可复用的 hydration hook

因此，下一个最合理的接力点，不是重新摸索，而是直接沿着当前模式，继续收尾 `career-values-test`。

