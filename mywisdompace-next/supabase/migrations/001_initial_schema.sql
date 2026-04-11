-- ==================== MyWisdompace 初始数据库 Schema ====================
-- 创建时间: 2026-04-11
-- 说明: 4张核心业务表 + RLS 行级安全策略
-- 执行方式: 在 Supabase Dashboard → SQL Editor 中运行

-- ==================== 1. users 表 ====================
-- 用户基本信息，与 Supabase Auth 的 auth.users 一一对应
-- 通过 trigger 在 auth.users 创建时自动插入记录
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 自动创建用户记录的 trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 自动更新 trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS 策略
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ==================== 2. assessments 表 ====================
-- 测评结果，单表存储所有类型，通过 type 字段区分
-- result 为 JSON 格式，不同测评类型有不同的结构
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- "mbti" | "big-five" | "ability" | "career-values" | 未来扩展
  result JSONB NOT NULL, -- 测评结果数据，结构因 type 而异
  is_latest BOOLEAN NOT NULL DEFAULT true, -- 标记是否为该类型最新一次测评
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引：按用户+类型查询最新测评
CREATE INDEX idx_assessments_user_type ON public.assessments(user_id, type);
CREATE INDEX idx_assessments_user_latest ON public.assessments(user_id, type) WHERE is_latest = true;

-- 当插入新测评时，自动将同类型旧记录的 is_latest 设为 false
CREATE OR REPLACE FUNCTION public.handle_new_assessment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.assessments
  SET is_latest = false
  WHERE user_id = NEW.user_id
    AND type = NEW.type
    AND id != NEW.id
    AND is_latest = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_assessment_created
  AFTER INSERT ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_assessment();

-- RLS 策略
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
  ON public.assessments FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== 3. progress 表 ====================
-- 一生整理进度，覆盖章节阅读/测评完成/工具使用/人生里程碑等
-- category + key 定位具体进度项，value 为 JSON 存储进度详情
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- "chapter-read" | "tool-completed" | "milestone" | 未来扩展
  key TEXT NOT NULL,      -- 具体标识："chapter-1" | "mbti-test" | "chapter-3-section-5"
  value JSONB NOT NULL DEFAULT '{}', -- 进度值：百分比、完成状态、时间戳等
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 唯一约束：每个用户的每个进度项只能有一条记录
CREATE UNIQUE INDEX idx_progress_user_category_key ON public.progress(user_id, category, key);

-- 自动更新 updated_at
CREATE TRIGGER on_progress_updated
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS 策略
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON public.progress FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== 4. conversations 表 ====================
-- AI 对话历史（预留给里程碑4 AI助手集成）
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT, -- 对话标题（可选，自动生成或用户编辑）
  messages JSONB NOT NULL DEFAULT '[]', -- 对话消息数组
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_user ON public.conversations(user_id, created_at DESC);

CREATE TRIGGER on_conversations_updated
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS 策略
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== 完成 ====================
-- 4张表已创建，RLS 已启用，trigger 已配置
