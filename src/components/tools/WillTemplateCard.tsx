import type { WillTemplate, TemplateVerdict, CostRow } from '@/data/will-templates/templates';

const verdictStyle: Record<TemplateVerdict, string> = {
  ok: 'bg-[#EDF4EC] text-[#3F6B45] border-[#CBDDC8]',
  caution: 'bg-[#FDF3E3] text-[#8A5A17] border-[#F0D9B0]',
  no: 'bg-[#FBEDEB] text-[#93372C] border-[#EFC9C2]',
};

const costDot: Record<CostRow['level'], string> = {
  low: 'bg-[#7A9A7E]',
  mid: 'bg-[#C79A47]',
  high: 'bg-[#B4595A]',
};

function ChecklistColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'fit' | 'unfit' | 'check';
}) {
  const header =
    tone === 'fit'
      ? 'text-[#3F6B45]'
      : tone === 'unfit'
        ? 'text-[#93372C]'
        : 'text-[#A85E2D]';
  const dot =
    tone === 'fit' ? 'bg-[#8FB093]' : tone === 'unfit' ? 'bg-[#D09A93]' : 'bg-[#D9B784]';

  return (
    <div className="rounded-xl border border-[#EDE2D0] bg-white p-3.5">
      <div className={`text-[12px] font-bold tracking-[0.08em] ${header}`}>{title}</div>
      <ul className="mt-2 space-y-1.5">
        {items.map(item => (
          <li key={item} className="flex gap-2 text-[12.5px] leading-[1.7] text-[#6A6256]">
            <span className={`mt-[7px] h-1 w-1 shrink-0 rounded-full ${dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WillTemplateCard({
  template,
  index,
  defaultOpen = false,
}: {
  template: WillTemplate;
  index: number;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-2xl border border-[#E8D9C2] bg-white"
    >
      {/* 折叠头 */}
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2.5 px-4 py-4 marker:hidden sm:px-5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FDF5EE] text-[12px] font-bold text-[#C87941]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] leading-snug font-bold text-[#4A3728]">
            {template.name}
          </span>
          <span className="mt-0.5 block text-[12.5px] leading-snug text-[#8A7E6A]">
            {template.subtitle}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${verdictStyle[template.verdict]}`}
        >
          {template.verdictLabel}
        </span>
        <svg
          className="h-4 w-4 shrink-0 text-[#B5A48C] transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 9l6 6 6-6" />
        </svg>
      </summary>

      <div className="border-t border-[#F0E6D6] px-4 py-4 sm:px-5 sm:py-5">
        {/* ① 顶部三栏 */}
        <div className="grid gap-2.5 sm:grid-cols-3">
          <ChecklistColumn title="适合谁用" items={template.checklist.fit} tone="fit" />
          <ChecklistColumn title="不适合谁" items={template.checklist.unfit} tone="unfit" />
          <ChecklistColumn title="抄完必查" items={template.checklist.mustCheck} tone="check" />
        </div>

        {/* ② 手抄正文 */}
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#C87941]" />
            <h4 className="text-[14px] font-bold text-[#4A3728]">手抄正文</h4>
            <span className="rounded-full bg-[#FDF5EE] px-2 py-0.5 text-[10.5px] font-medium text-[#A85E2D]">
              只能照着抄，不能打印
            </span>
          </div>
          <div className="mt-2.5 rounded-xl border border-[#E8D9C2] bg-[#FDFBF5] px-4 py-5 sm:px-6 sm:py-6">
            <div className="font-serif text-[14.5px] leading-[2.15] text-[#3D2D22] sm:text-[15px]">
              {template.body.map((line, i) =>
                line.blank ? (
                  <div key={`b-${i}`} className="h-3" />
                ) : (
                  <p
                    key={`l-${i}`}
                    className={
                      line.kind === 'title'
                        ? 'text-center text-[17px] font-bold tracking-[0.5em] text-[#4A3728]'
                        :                       line.kind === 'sign'
                          ? 'pl-10 text-left'
                          : 'text-justify tracking-[0.02em]'
                    }
                  >
                    {line.text}
                  </p>
                )
              )}
            </div>
          </div>
          <p className="mt-2 text-[12px] leading-[1.7] text-[#A8927A]">
            下划线处为需要你亲笔填写的内容。抄写时不要涂改；写错了就整份重抄一遍，注新的日期。
          </p>
        </div>

        {/* ③ 逐句注解 */}
        <div className="mt-5">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#C87941]" />
            <h4 className="text-[14px] font-bold text-[#4A3728]">逐句注解</h4>
            <span className="text-[11px] text-[#A8927A]">共 {template.annotations.length} 处</span>
          </div>
          <div className="mt-2.5 space-y-2">
            {template.annotations.map(a => (
              <div key={a.quote} className="rounded-xl border border-[#EDE2D0] bg-[#FAF8F3] p-3.5">
                <p className="border-l-[3px] border-[#C87941] pl-2.5 font-serif text-[13px] leading-[1.7] text-[#8A5A17]">
                  {a.quote}
                </p>
                <p className="mt-2 text-[12.5px] leading-[1.75] text-[#6A6256]">
                  <span className="font-semibold text-[#3F6B45]">为什么必须写：</span>
                  {a.why}
                </p>
                <p className="mt-1 text-[12.5px] leading-[1.75] text-[#6A6256]">
                  <span className="font-semibold text-[#93372C]">不写会怎样：</span>
                  {a.risk}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ④ 成本对照 */}
        <div className="mt-5">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#C87941]" />
            <h4 className="text-[14px] font-bold text-[#4A3728]">成本对照</h4>
          </div>
          <div className="mt-2.5 overflow-hidden rounded-xl border border-[#EDE2D0] bg-white">
            {template.costs.map((c, i) => (
              <div
                key={c.label}
                className={`flex items-center gap-3 px-3.5 py-2.5 ${
                  i === template.costs.length - 1 ? '' : 'border-b border-[#F5EFE6]'
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${costDot[c.level]}`} />
                <span className="w-16 shrink-0 text-[12.5px] font-medium text-[#8A7E6A]">
                  {c.label}
                </span>
                <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-[#4A3728]">
                  {c.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 提醒 */}
        <ul className="mt-4 space-y-1.5">
          {template.warnings.map(w => (
            <li key={w} className="flex gap-2 text-[12.5px] leading-[1.75] text-[#8A7E6A]">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#D9C6AC]" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
