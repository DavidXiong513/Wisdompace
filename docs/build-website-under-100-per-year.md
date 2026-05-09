# 不到100元/年打造上线一个网站？

> 这是我在 2026 年 5 月搭建「MyWisdompace」网站的真实经历——从零到上线全链路跑通，包括域名、前端、后端、数据库、邮件发送、自动部署。记录下来，给想建站的朋友一个参考。

---

## 一、先说结论：一年到底花多少钱？

| 项目         | 费用         | 备注                                        |
| ------------ | ------------ | ------------------------------------------- |
| 域名（.com） | ≈70元/年     | 阿里云/腾讯云购买，这是唯一逃不掉的刚性支出 |
| 服务器       | **0元**      | Vercel 免费版足够前期使用                   |
| 数据库       | **0元**      | Supabase 免费版（500MB 存储，5万行数据）    |
| 邮件发送     | **0元**      | Resend 免费版（100封/月）                   |
| SSL 证书     | **0元**      | Vercel 自动配置 HTTPS                       |
| CI/CD        | **0元**      | Vercel + GitHub 自动部署                    |
| **合计**     | **≈70元/年** | 流量不大时，真的一年不到一百块              |

**前提条件**：你的网站还在起步阶段，日活不到几千人。等流量真上来了，再考虑付费方案也不迟。

---

## 二、技术选型：为什么选这套组合？

### 整体架构一览

```
用户浏览器
    ↓
  Vercel（托管前端 + API 路由）
    ├── Next.js 前端页面
    ├── API Routes（后端接口）
    ├── Supabase（数据库 + 用户认证）
    ├── Resend（邮件发送）
    └── GitHub（代码仓库 + 自动部署）
```

### 前端：Next.js + React + TypeScript

| 技术               | 作用     | 为什么选它                                  |
| ------------------ | -------- | ------------------------------------------- |
| **Next.js**        | 全栈框架 | SSR/SSG 双模式，SEO 友好，API 路由即后端    |
| **React 19**       | UI 库    | 生态最大，组件最多，找工作也用得上          |
| **TypeScript**     | 类型系统 | 在编译阶段就抓 bug，比上线后出 bug 强一万倍 |
| **Tailwind CSS 4** | 样式     | 原子化 CSS，不用起类名，写起来快            |
| **Zustand**        | 状态管理 | 比 Redux 轻量 90%，3 行代码就能用           |

**一句话总结**：Next.js 是目前 React 生态的"标准答案"，选它不会错。

### 后端：Next.js API Routes + Supabase

| 技术               | 作用          | 为什么选它                                            |
| ------------------ | ------------- | ----------------------------------------------------- |
| **API Routes**     | 后端接口      | 前后端一个项目搞定，不用单独搞服务器                  |
| **Supabase**       | 数据库 + 认证 | 免费版就带 PostgreSQL + 用户登录 + 行级权限           |
| **Zod**            | 参数校验      | API 入参验证，用户传错数据直接拦截                    |
| **TanStack Query** | 数据缓存      | 服务端数据自动缓存、刷新、重试，不用手写 loading 逻辑 |

**一句话总结**：不需要 Java/Python 后端，Next.js 的 API 路由 + Supabase 就够了。

### 邮件发送：Resend

| 技术           | 作用      | 为什么选它                                           |
| -------------- | --------- | ---------------------------------------------------- |
| **Resend**     | 邮件 API  | HTTP 接口发邮件，不用连 SMTP 服务器，Vercel 原生兼容 |
| **Nodemailer** | SMTP 备用 | 本地开发时用，线上走 Resend                          |

**避坑提醒**：Vercel 的 Serverless 环境无法直接连接国内的 SMTP 服务器（如 `smtp.qq.com`），会报 DNS 解析失败。用 Resend 的 HTTP API 就没这个问题。

### 工程化工具

| 技术                    | 作用               |
| ----------------------- | ------------------ |
| **Vitest**              | 单元测试           |
| **Playwright**          | E2E 测试           |
| **ESLint + Prettier**   | 代码规范 + 格式化  |
| **Husky + lint-staged** | Git 提交前自动检查 |
| **GitHub Actions**      | CI/CD 流水线       |

---

## 三、上线全流程（从零到能访问）

### 第 1 步：注册账号（免费）

- [GitHub](https://github.com) — 代码仓库
- [Vercel](https://vercel.com) — 网站托管
- [Supabase](https://supabase.com) — 数据库
- [Resend](https://resend.com) — 邮件发送

### 第 2 步：买域名（≈70元/年）

- 阿里云/腾讯云搜你想买的域名
- `.com` 最通用，首年大约 60-80 元
- 买完在 DNS 解析里先别动，等第 5 步一起配

### 第 3 步：写代码

```bash
# 用 Next.js 官方脚手架创建项目
npx create-next-app@latest my-site --typescript --tailwind --app

# 启动开发服务器
cd my-site
npm run dev
```

然后就是写页面、写接口、接数据库……这部分是"体力活"，不是本文重点。

### 第 4 步：代码推送到 GitHub

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 第 5 步：Vercel 部署

1. 登录 Vercel → **Import Project** → 选 GitHub 仓库
2. 一路点 Next，Vercel 自动识别 Next.js 项目
3. 等待 1 分钟，部署完成，获得一个 `xxx.vercel.app` 的临时域名
4. 在 Vercel **Settings → Domains** 里添加你的自定义域名
5. 去阿里云 DNS 解析，添加记录：

| 类型  | 主机记录 | 记录值               |
| ----- | -------- | -------------------- |
| CNAME | www      | cname.vercel-dns.com |
| A     | @        | 76.76.21.21          |

6. 等 DNS 传播（5-30 分钟），你的域名就能访问了

### 第 6 步：配置环境变量

在 Vercel **Settings → Environment Variables** 里添加：

| 变量名                          | 值                                | 来源                           |
| ------------------------------- | --------------------------------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxx.supabase.co`         | Supabase 后台 → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...`                       | Supabase 后台 → Settings → API |
| `RESEND_API_KEY`                | `re_xxxxx`                        | Resend 后台 → API Keys         |
| `RESEND_FROM`                   | `你的站名 <noreply@你的域名.com>` | 需先在 Resend 验证域名         |
| `MAIL_TO`                       | 你的收件邮箱                      | 你想收邮件的地址               |

### 第 7 步：Resend 域名验证（邮件能发的关键）

1. Resend 后台 → **Domains** → **Add Domain** → 输入你的域名
2. Resend 会给你 3-4 条 DNS 记录，去阿里云 DNS 添加：
   - **TXT 记录**（DKIM 签名）
   - **TXT 记录**（SPF 授权）
   - **TXT 记录**（DMARC 策略）
   - **MX 记录**（可选，用于接收退信）
3. 等 DNS 传播（5-30 分钟），Resend 状态变绿即验证通过
4. 验证通过后，就能用 `noreply@你的域名.com` 发邮件了

### 第 8 步：自动部署

从现在开始，每次你 `git push`，Vercel 会自动：

1. 拉取最新代码
2. 运行 `npm run build`
3. 部署到全球 CDN
4. 你的网站自动更新

**无需手动操作，推代码就是部署。**

---

## 四、我踩过的坑

### 坑 1：Vercel 上发不了邮件

**现象**：联系表单提交报错，`getaddrinfo EBUSY smtp.qq.com`（DNS 解析失败）

**原因**：Vercel 的 Serverless 环境无法直连国内 SMTP 服务器

**解决**：用 Resend 的 HTTP API 发邮件，不走 SMTP 端口

### 坑 2：图片路径大小写

**现象**：本地开发图片正常，部署后图片 404

**原因**：Windows 不区分文件名大小写，Linux 区分。本地 `Images/` 和 `images/` 都能访问，部署到 Vercel（Linux）就不行了

**解决**：确保代码中的路径和实际文件名大小写完全一致

### 坑 3：Resend 测试地址只能发给自己

**现象**：用 `onboarding@resend.dev` 发邮件，只有注册 Resend 的邮箱能收到

**原因**：这是 Resend 的限制，测试地址不能发给任意邮箱

**解决**：验证自己的域名后，用 `noreply@你的域名.com` 就能发给任何人

---

## 五、这套方案的局限性

| 局限            | 说明                                | 什么时候需要升级                  |
| --------------- | ----------------------------------- | --------------------------------- |
| Vercel 免费版   | 100GB 带宽/月，Serverless 10 秒超时 | 日活过万或 API 响应慢时           |
| Supabase 免费版 | 500MB 存储，暂停项目会休眠          | 数据量超 500MB 或需 24 小时在线时 |
| Resend 免费版   | 100 封/月                           | 日发送量超 3 封时                 |
| 无独立后端      | 复杂业务逻辑全塞 API Routes         | 业务逻辑很复杂、需要定时任务等时  |

**但说实话**：90% 的个人站和小项目，免费版完全够用。先跑起来，再优化。

---

## 六、一句话总结

> **买一个域名，剩下的全用免费方案，一年不到一百块就能上线一个正经网站。**
>
> 技术栈：Next.js + Supabase + Resend + Vercel，前后端一体，自动部署，HTTPS 开箱即用。
>
> 最大的成本不是钱，是你写代码的时间。

---

_本文基于 MyWisdompace（wisdompace.com）的实际搭建经验整理，2026 年 5 月。_
