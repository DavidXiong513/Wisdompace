// ==================== 人生角色饼图测评类型定义 ==================== //

/** 角色分类 */
export type RoleCategory = '家庭' | '工作' | '社交';

/** 预置角色 */
export interface PresetRole {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: RoleCategory;
}

/** 用户自定义角色 */
export interface CustomRole {
  id: string;
  name: string;
}

/** 用户填写的角色评估数据 */
export interface RoleAssessment {
  roleId: string;
  /** 角色名称（预置或自定义） */
  name: string;
  /** 重视程度 1-5 */
  importance: number;
  /** 核心排名 0=非核心, 1=第1, 2=第2, 3=第3 */
  coreRank: number;
  /** 每周投入小时数 */
  hoursPerWeek: number;
}

/** 偏差分析条目 */
export interface DeviationItem {
  roleId: string;
  name: string;
  importance: number;
  hoursPerWeek: number;
  timePercent: number;
  type: 'underinvested' | 'overinvested' | 'balanced';
  analysis: string;
}

/** 核心角色深度解读 */
export interface CoreRoleInterpretation {
  roleId: string;
  name: string;
  rank: 1 | 2 | 3;
  stars: string;
  importance: number;
  hoursPerWeek: number;
  timePercent: number;
  interpretation: string;
}

/** 极端情况提醒 */
export interface LowIdentityAlert {
  triggered: boolean;
  roleCount: number;
  message: string;
}

/** 完整报告数据 */
export interface RolePieChartReport {
  /** 所有评估过的角色（按重视程度降序） */
  allRoles: RoleAssessment[];
  /** 核心角色（3个，按排名） */
  coreRoles: CoreRoleInterpretation[];
  /** 重视程度权重饼图数据 */
  importanceData: { name: string; value: number }[];
  /** 时间分配饼图数据 */
  timeData: { name: string; value: number }[];
  /** 偏差分析 */
  deviations: DeviationItem[];
  /** 低身份提醒 */
  lowIdentityAlert: LowIdentityAlert;
  /** 极端情况深度分析 */
  extremeSituationAnalysis: string;
  /** 综合洞察 */
  overallInsights: string;
  /** 生成时间 */
  completedAt: string;
}

/** 测评阶段 */
export type RPCPhase = 'welcome' | 'select-roles' | 'importance' | 'time' | 'report';
