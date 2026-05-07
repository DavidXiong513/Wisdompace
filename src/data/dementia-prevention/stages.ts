// ── 阿尔茨海默病七个发展阶段（科普数据） ──

export interface Stage {
  id: number;
  label: string;
  subtitle: string;
  timeframe: string;
  keySymptoms: string[];
  interventionWindow: "primary" | "golden" | "late-golden" | "palliative";
  note?: string;
}

export const stages: Stage[] = [
  {
    id: 1,
    label: "潜伏期",
    subtitle: "无明显感知",
    timeframe: "确诊前 10-15 年；最早 50 岁左右出现",
    keySymptoms: [
      "大脑开始少量淀粉样蛋白沉积",
      "略微感觉记忆力不如从前",
      "认知功能完全正常",
    ],
    interventionWindow: "primary",
    note: "这是预防的关键期！从四大健脑要素切入：充分脑力锻炼、体力锻炼、饮食调控和三高控制",
  },
  {
    id: 2,
    label: "记忆下滑期",
    subtitle: "主观认知下降",
    timeframe: "发病前 5-10 年",
    keySymptoms: [
      "自我感觉记忆力明显下滑",
      "周围人能感觉到变化",
      "出现「主观认知下降」",
    ],
    interventionWindow: "golden",
    note: "诊断治疗的关键期！可用 2024 年新药（仑卡奈单抗/多纳单抗，约 20 万/年）",
  },
  {
    id: 3,
    label: "轻度认知障碍",
    subtitle: "MCI 阶段",
    timeframe: "确诊前 0-3 年",
    keySymptoms: [
      "认知功能显著下降",
      "基础生活能力保留可自理",
      "炉灶忘记关火、东西放错地方",
    ],
    interventionWindow: "golden",
    note: "诊断治疗的最后时期！新药仍有效",
  },
  {
    id: 4,
    label: "轻度痴呆",
    subtitle: "AD 早期",
    timeframe: "正式确诊",
    keySymptoms: [
      "基础自理能力保留",
      "复杂事务需帮助",
      "时空概念混乱",
    ],
    interventionWindow: "late-golden",
    note: "新药的「关门期」——最后可用阶段",
  },
  {
    id: 5,
    label: "中度痴呆",
    subtitle: "AD 中期",
    timeframe: "确诊后进展期",
    keySymptoms: [
      "日常基础生活无法自理",
      "上厕所、吃饭需辅助",
      "新药已不再适用",
    ],
    interventionWindow: "palliative",
    note: "仅能传统缓和保守治疗",
  },
  {
    id: 6,
    label: "重度痴呆",
    subtitle: "AD 晚期",
    timeframe: "持续进展期",
    keySymptoms: [
      "几乎没有认知能力",
      "无法理解复杂信息和指令",
      "不知自己在哪里",
    ],
    interventionWindow: "palliative",
    note: "基本只能缓和治疗，对症处理",
  },
  {
    id: 7,
    label: "临终阶段",
    subtitle: "末期",
    timeframe: "生命末程",
    keySymptoms: [
      "对周围事物很少反应",
      "吞咽功能障碍",
      "失去基本行走能力",
    ],
    interventionWindow: "palliative",
    note: "常见死因：呛咳、肺部感染、摔倒",
  },
];

// 干预窗口颜色和说明
export const windowColors: Record<string, string> = {
  primary: "bg-emerald-100 text-emerald-800 border-emerald-300",
  golden: "bg-amber-100 text-amber-800 border-amber-300",
  "late-golden": "bg-orange-100 text-orange-800 border-orange-300",
  palliative: "bg-slate-100 text-slate-600 border-slate-300",
};

export const windowLabels: Record<string, string> = {
  primary: "预防关键期 🟢",
  golden: "干预黄金期 🟡",
  "late-golden": "最后窗口期 🟠",
  palliative: "保守治疗期",
};
