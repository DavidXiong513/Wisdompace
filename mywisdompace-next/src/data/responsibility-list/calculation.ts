import type {
  ResponsibilityCategory,
  UrgencyLevel,
  ImportanceLevel,
  Quadrant,
} from "./responsibilityData";
import { getQuadrant, quadrantDefs, categoryMeta } from "./responsibilityData";

// ── 类型定义 ──

export type RatedItem = {
  id: string;
  label: string;
  category: ResponsibilityCategory;
  urgency: UrgencyLevel;
  importance: ImportanceLevel;
  quadrant: Quadrant;
};

export type HandoverInfo = {
  successor: string;
  notes: string;
};

export type ReportData = {
  ratedItems: RatedItem[];
  handovers: Record<string, HandoverInfo>;
  categorySummary: {
    category: ResponsibilityCategory;
    count: number;
    items: RatedItem[];
  }[];
  quadrantSummary: {
    quadrant: Quadrant;
    count: number;
    items: RatedItem[];
  }[];
};

// ── 生成报告 ──

export function generateReport(
  selectedIds: string[],
  labels: Record<string, string>,
  categories: Record<string, ResponsibilityCategory>,
  ratings: Record<string, { urgency: UrgencyLevel; importance: ImportanceLevel }>,
  handovers: Record<string, HandoverInfo>
): ReportData {
  // 构建已评估项
  const ratedItems: RatedItem[] = selectedIds
    .filter((id) => ratings[id])
    .map((id) => {
      const rating = ratings[id];
      return {
        id,
        label: labels[id] ?? id,
        category: categories[id] ?? "self",
        urgency: rating.urgency,
        importance: rating.importance,
        quadrant: getQuadrant(rating.urgency, rating.importance),
      };
    });

  // 按类别汇总
  const catOrder: ResponsibilityCategory[] = [
    "work", "family", "grandparent", "social", "self",
  ];
  const categorySummary = catOrder.map((cat) => ({
    category: cat,
    count: ratedItems.filter((r) => r.category === cat).length,
    items: ratedItems.filter((r) => r.category === cat),
  }));

  // 按象限汇总
  const quadOrder: Quadrant[] = ["do-first", "schedule", "delegate", "eliminate"];
  const quadrantSummary = quadOrder.map((q) => ({
    quadrant: q,
    count: ratedItems.filter((r) => r.quadrant === q).length,
    items: ratedItems.filter((r) => r.quadrant === q),
  }));

  return { ratedItems, handovers, categorySummary, quadrantSummary };
}

// ── 统计 ──

export function getCompletionStats(
  totalSelected: number,
  ratedCount: number,
  handoverCount: number
): {
  selectPct: number;
  ratePct: number;
  handoverPct: number;
  overallPct: number;
} {
  const selectPct = 100; // 进入评估阶段说明选择已完成
  const ratePct = totalSelected > 0 ? Math.round((ratedCount / totalSelected) * 100) : 0;
  const handoverPct = totalSelected > 0 ? Math.round((handoverCount / totalSelected) * 100) : 0;
  const overallPct = totalSelected > 0
    ? Math.round(((ratedCount + handoverCount) / (totalSelected * 2)) * 100)
    : 0;
  return { selectPct, ratePct, handoverPct, overallPct };
}
