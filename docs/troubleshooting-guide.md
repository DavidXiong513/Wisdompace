# Next.js Turbopack 崩溃急救与防复发指南

> 基于 2026-04-16 实际踩坑整理，适用于 mywisdompace-next (Next.js 16.x + Turbopack + Tailwind CSS v4)

---

## 一、已发生的崩溃类型

| # | 崩溃类型 | 触发条件 | 严重度 |
|---|---------|---------|-------|
| 1 | **Turbopack 缓存损坏** | dev server 异常退出、强制关闭终端、电脑断电 | 🔴 高 |
| 2 | **Zustand persist OOM** | localStorage 数据膨胀/损坏，反序列化内存爆炸 | 🔴 高（可致整机死机） |
| 3 | **孤儿 Node 进程堆积** | 崩溃后未清理进程，锁住 `.next` 目录 | 🟡 中 |

---

## 二、Turbopack 缓存损坏

### 2.1 识别症状

- 浏览器白屏，终端报错：`Failed to find the Turbopack compiled artifact for postcss.ts`
- 或报错：`ENOENT: no such file or directory, open '.next/...'`
- 端口占用但页面无响应（TIME_WAIT 状态）

### 2.2 一键修复脚本

在 `mywisdompace-next` 目录下执行：

```powershell
# Step 1: 杀掉所有残留 Node 进程
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Step 2: 删除损坏的构建缓存
Remove-Item -Recurse -Force .next

# Step 3: 重启
npm run dev
```

### 2.3 如果 Remove-Item 报"目录非空"

说明还有进程锁文件，**必须先执行 Step 1 杀进程**，再重新执行 Step 2。

如果杀进程后仍无法删除，尝试：

```powershell
# 等待 3 秒让文件锁释放
Start-Sleep -Seconds 3
Remove-Item -Recurse -Force .next
```

---

## 三、Zustand persist OOM

### 3.1 识别症状

- 浏览器内存飙升至数 GB
- 电脑卡死/死机，需强制重启
- 重启后问题反复出现（因为坏数据还在 localStorage 里）

### 3.2 代码防护（已实施）

在 Zustand store 的 persist 配置中加入 `deserialize` 三重防护：

```typescript
persist({
  name: 'store-name',
  deserialize: (str) => {
    try {
      const parsed = JSON.parse(str);
      // 防护1: 数组容量上限
      if (Array.isArray(parsed?.state?.items) && parsed.state.items.length > 100) {
        return JSON.parse(str.replace(/"items"\s*:\s*\[.*?\]/, '"items":[]'));
      }
      // 防护2: 结构校验
      if (typeof parsed?.state?.items !== 'object') {
        throw new Error('Invalid structure');
      }
      return parsed;
    } catch {
      // 防护3: JSON 解析失败 → 回退初始状态
      return {};
    }
  },
})
```

### 3.3 用户手动清数据

如果 OOM 已经发生，浏览器无法正常加载，在 Console 执行：

```javascript
localStorage.removeItem('role-pie-chart-storage');
location.reload();
```

---

## 四、防复发最佳实践

### 4.1 日常开发习惯

| 场景 | 正确操作 | 错误操作 |
|------|---------|---------|
| 关闭 dev server | 终端按 **Ctrl+C** | 直接关闭终端窗口 ❌ |
| 切换分支前 | 先 Ctrl+C 停止 server | 直接 git checkout ❌ |
| 电脑休眠前 | 先 Ctrl+C 停止 server | 直接合盖 ❌ |
| 安装新依赖后 | 停 server → 安装 → 删 .next → 重启 | 不重启直接装 ❌ |

### 4.2 建议添加 npm scripts

在 `package.json` 中加入以下便捷命令：

```json
{
  "scripts": {
    "dev:clean": "Remove-Item -Recurse -Force .next; next dev",
    "clean": "Remove-Item -Recurse -Force .next node_modules/.cache",
    "kill:node": "Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force"
  }
}
```

> 注意：PowerShell 命令作为 npm script 需要用 `pwsh -c "..."` 包装，或改用跨平台写法：
> ```json
> "dev:clean": "rimraf .next && next dev",
> "clean": "rimraf .next node_modules/.cache"
> ```
> 需先 `npm install -D rimraf`

### 4.3 Tailwind CSS v4 注意事项

- Tailwind v4 **不需要** `tailwind.config.ts`，使用 `@import "tailwindcss"` 语法
- PostCSS 配置用 `@tailwindcss/postcss` 插件（已正确配置）
- **不要**误装 Tailwind v3 的包（`tailwindcss@3`, `autoprefixer`, `postcss`），会冲突

### 4.4 目录结构红线

- ✅ **只在** `mywisdompace-next/` 目录下运行 npm 命令
- ❌ **绝不在**父目录 `MyWisdompace/` 运行 npm 命令（会导致路径解析错误）
- ❌ **绝不在** `d:/AICode/` 运行 npm 命令

---

## 五、急救速查卡

```
┌─────────────────────────────────────────────┐
│         Next.js 崩溃急救速查卡              │
├─────────────────────────────────────────────┤
│                                             │
│  症状1: Turbopack 缓存损坏                  │
│  → 杀进程 → 删 .next → npm run dev          │
│                                             │
│  症状2: 浏览器 OOM 内存爆炸                 │
│  → F12 Console → localStorage.removeItem()  │
│  → location.reload()                        │
│                                             │
│  症状3: 端口被占用                          │
│  → 杀 Node 进程 → 等3秒 → 重启             │
│                                             │
│  万能重启: 杀进程 + 删 .next + npm run dev   │
│                                             │
└─────────────────────────────────────────────┘
```

---

*最后更新: 2026-04-16*
