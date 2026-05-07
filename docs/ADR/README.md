# 架构决策记录 (ADR)

本目录记录 MyWisdompace-next 项目的关键架构决策。

## 什么是 ADR？

架构决策记录（Architecture Decision Records）是记录项目中重要技术决策的文档，帮助团队成员理解决策背后的原因，以及当时考虑的因素。

## ADR 格式

每个 ADR 使用以下格式：

```markdown
# ADR-XXX: 标题

- 日期：YYYY-MM-DD
- 状态：提议/已接受/已废弃
- 决策人：@username

## 背景

问题描述和上下文...

## 决策

做出的决定...

## 考虑因素

- 选项1：...
- 选项2：...

## 后果

正面影响：...
负面影响：...

## 参考

- 链接1
- 链接2
```

## ADR 列表

| 编号 | 标题 | 日期 | 状态 |
|------|------|------|------|
| [ADR-001](./ADR-001-nextjs-framework.md) | 使用 Next.js 作为前端框架 | 2026-04-10 | 已接受 |
| [ADR-002](./ADR-002-vitest-testing.md) | 使用 Vitest + Playwright 测试框架 | 2026-04-10 | 已接受 |

## 参考

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)
