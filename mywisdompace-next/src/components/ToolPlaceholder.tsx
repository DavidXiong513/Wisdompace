import { getToolInfo, getToolStatusText } from "@/lib/tools";

export function ToolPlaceholder({ toolId }: { toolId: string }) {
  const tool = getToolInfo(toolId);
  if (!tool) return null;

  const statusText = getToolStatusText(tool.status);
  const statusClass =
    tool.status === "ready"
      ? "bg-emerald-600 text-white"
      : tool.status === "maintenance"
        ? "bg-zinc-200 text-zinc-700"
        : "bg-amber-200 text-zinc-900";

  return (
    <div className="mt-8 rounded-2xl border border-border bg-background/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-foreground">{tool.name}</div>
          <div className="mt-1 text-sm text-muted">{tool.description}</div>
        </div>
        <span
          className={
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium " + statusClass
          }
        >
          {statusText}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted opacity-60"
        >
          展开工具
        </button>

        <details className="group">
          <summary className="cursor-pointer list-none rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground">
            了解更多
          </summary>
          <div className="mt-2 max-w-xl rounded-xl border border-border bg-surface p-3 text-sm text-muted shadow-[var(--shadow-card)]">
            这是占位组件：后续会把工具做成可交互模块，并支持登录后保存。
          </div>
        </details>
      </div>

      <div className="mt-3 text-xs text-muted">
        toolId: <span className="font-mono">{toolId}</span>
      </div>
    </div>
  );
}
