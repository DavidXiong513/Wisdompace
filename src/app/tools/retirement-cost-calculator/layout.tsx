import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '晚年花费测算｜从退休到离世，我需要准备多少钱',
  description:
    '把退休后的日常、住房、医疗、照护、旅行与爱好放进同一本账，结合生命余光参考寿命，测算晚年支出、可覆盖资金与照护风险。数据仅保存在本机。',
};

export default function RetirementCostCalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
