-- ==================== MyWisdompace 迁移 003 ====================
-- 创建时间: 2026-05-09
-- 说明: 为 assessments 表补充 UPDATE RLS 策略
--
-- 背景: 初始 schema 中 assessments 表只有 SELECT/INSERT/DELETE 策略，
-- 缺少 UPDATE 策略。虽然当前 API 不使用 UPDATE（通过 INSERT + is_latest 标记），
-- 但显式添加 UPDATE RLS 可以：
-- 1. 防止未来误添加过于宽松的 UPDATE 策略
-- 2. 符合纵深防御原则，与其他表（progress, conversations）策略保持一致
-- 3. 为未来可能的需求（如更新测评备注）预留安全通道

-- 添加 UPDATE 策略：用户只能更新自己的测评记录
CREATE POLICY "Users can update own assessments"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================== 完成说明 ====================
-- 现在 assessments 表拥有完整的 CRUD RLS 策略：
-- SELECT  → USING (auth.uid() = user_id)
-- INSERT  → WITH CHECK (auth.uid() = user_id)
-- UPDATE  → USING + WITH CHECK (auth.uid() = user_id)  ← 本次新增
-- DELETE  → USING (auth.uid() = user_id)
