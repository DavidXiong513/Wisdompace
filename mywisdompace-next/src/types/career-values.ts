// ==================== 生涯价值观测评类型定义 ==================== //

/** 单个价值观 */
export interface CareerValue {
  id: string;           // 如 'altruism'
  name: string;         // 如 '利他主义'
  shortName: string;    // 造句用简称，如 '利他'
  description: string;  // 完整解读
  icon: string;         // emoji
  category: '内在回报' | '外在条件' | '人际关系';
}

/** 测评阶段 */
export type CVPhase = 'welcome' | 'explore' | 'select8' | 'rank3' | 'sentence' | 'report';

/** 价值观冲突对 */
export interface ValueConflict {
  left: string;       // 左侧价值观id
  right: string;      // 右侧价值观id
  reason: string;     // 矛盾原因说明
}

/** 报告中的价值观解读 */
export interface ValueInterpretation {
  id: string;
  name: string;
  rank: 1 | 2 | 3;
  role: string;       // 如 '核心驱动力' / '重要支撑' / '潜在需求'
  interpretation: string;
}

/** 完整报告数据 */
export interface CareerValuesReport {
  /** 核心价值观（3个，按重要性排列） */
  coreValues: ValueInterpretation[];
  /** 被淘汰的价值观路径 */
  eliminatedPath: {
    from14to8: string[];   // 从14个中未被选入8个的
    from8to3: string[];    // 从8个中未被选入3个的
  };
  /** 造句内容 */
  sentence: string;
  /** 现实锚定评分 */
  realityScore: number;
  /** 检测到的价值观冲突 */
  detectedConflicts: ValueConflict[];
  /** 综合分析 */
  overallAnalysis: string;
  /** 生成时间 */
  completedAt: string;
}
