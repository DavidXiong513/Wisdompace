'use client';

import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import { useAgingChoiceStore } from '@/stores/agingChoiceStore';
import { institutionNotice, institutionTypes } from '@/data/aging-choice/agingData';

/**
 * 落地页底部的「五类机构」参考区。
 * 机构侧分支（branch === 'facility'）里向导自己已经完整展示过一次，
 * 此时隐藏，避免同一页出现两份对照表。
 */
export default function AgingReferenceSection() {
  const hydrated = usePersistHydrated(useAgingChoiceStore);
  const branch = useAgingChoiceStore((s) => s.branch);

  if (hydrated && branch === 'facility') return null;

  return (
    <section className="mt-8 rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
      <h3 className="text-[15px] font-bold text-[#4A3728]">五类机构，先分清</h3>
      <ul className="mt-3 divide-y divide-[#F0E6D6]">
        {institutionTypes.map((item) => (
          <li key={item.key} className="flex items-baseline gap-3 py-2.5">
            <span className="w-[7.5em] shrink-0 text-[13.5px] font-bold text-[#C87941]">
              {item.name}
            </span>
            <span className="text-[13px] leading-[1.7] text-[#5A5A5A]">{item.fitFor}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-[#F0E6D6] pt-3 text-[12px] leading-[1.7] text-[#A8927A]">
        {institutionNotice}
      </p>
    </section>
  );
}
