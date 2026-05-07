/**
 * Supabase 数据库类型定义
 * 对应 supabase/migrations/001_initial_schema.sql
 * 
 * 当 Supabase 数据库创建完成后，可以用 supabase gen types 自动生成更精确的类型
 * 此文件为手动维护的版本，确保前端开发可以立即开始
 */

// ==================== 数据库表类型 ====================

export type AssessmentType =
  | 'mbti'
  | 'big-five'
  | 'ability'
  | 'career-values'
  // 未来扩展：只需在此添加新类型
  | string;

export type ProgressCategory =
  | 'chapter-read'      // 章节阅读进度
  | 'tool-completed'    // 测评/工具完成情况
  | 'milestone'         // 人生里程碑
  | 'reflection-answer' // 思考题回答
  | 'tool-state'        // 工具中间状态
  | 'preference'        // 用户偏好设置
  // 未来扩展
  | string;

export interface DatabaseUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  user_id: string;
  type: AssessmentType;
  result: Record<string, unknown>; // JSONB，结构因 type 而异
  is_latest: boolean;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  category: ProgressCategory;
  key: string;
  value: Record<string, unknown>; // JSONB，进度详情
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  messages: ConversationMessage[];
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// ==================== 测评结果类型（按 type 区分）====================

export interface MbtiResult {
  type: string;           // "INTJ" 等
  dimensions: {           // 4个维度的分数
    ei: { e: number; i: number };
    sn: { s: number; n: number };
    tf: { t: number; f: number };
    jp: { j: number; p: number };
  };
  description?: string;
}

export interface BigFiveResult {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  percentiles: Record<string, number>;
  levels: Record<string, string>;
}

export interface AbilityResult {
  items: Array<{
    id: string;
    selfRating: number;   // 1-5
    interestRating: number; // 1-5
  }>;
  quadrants?: {
    highAbilityHighInterest: string[];
    highAbilityLowInterest: string[];
    lowAbilityHighInterest: string[];
    lowAbilityLowInterest: string[];
  };
}

export interface CareerValuesResult {
  top3: string[];         // 最终选出的3个价值观
  top8: string[];         // 从14选8
  sentences: Array<{
    value: string;
    template: string;
    realityAnchor: string;
    realismScore: number;  // 1-10 滑块
  }>;
  eliminatedPath: {
    from14to8: string[];
    from8to3: string[];
  };
}

// ==================== 进度值类型（按 category 区分）====================

export interface ChapterReadProgress {
  percentage: number;      // 0-100
  lastSectionId?: string;
  completedSections?: string[];
}

export interface ToolCompletedProgress {
  completed: boolean;
  completedAt?: string;
  assessmentId?: string;   // 关联的测评记录ID
}

export interface MilestoneProgress {
  achieved: boolean;
  achievedAt?: string;
  note?: string;
}

// ==================== Supabase Database Schema ====================
// 用于 supabase client 的泛型参数

export interface Database {
  public: {
    Tables: {
      users: {
        Row: DatabaseUser;
        Insert: Omit<DatabaseUser, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseUser, 'id' | 'created_at'>>;
      };
      assessments: {
        Row: Assessment;
        Insert: Omit<Assessment, 'id' | 'created_at'>;
        Update: Partial<Omit<Assessment, 'id' | 'user_id' | 'created_at'>>;
      };
      progress: {
        Row: Progress;
        Insert: Omit<Progress, 'id' | 'updated_at'>;
        Update: Partial<Omit<Progress, 'id' | 'user_id' | 'category' | 'key'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'user_id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
