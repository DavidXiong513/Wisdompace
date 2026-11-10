-- 005_poll_hardening.sql
-- 投票工具加固：登录用户归属、防刷审计字段、查询索引
--
-- 背景：004 的 poll_votes 只有匿名 session 维度，导致
--   1) 登录用户换设备可重复投票
--   2) 无法做「我的投票记录」跨设备回查
--   3) 没有防刷审计字段
-- 本迁移只做加法（ADD COLUMN / CREATE INDEX / 新增 SELECT 策略），
-- 不改动既有列与唯一约束，可安全重复执行。

-- ── 1. 新增字段 ──

ALTER TABLE poll_votes
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE poll_votes
  ADD COLUMN IF NOT EXISTS ip_hash TEXT;

ALTER TABLE poll_votes
  ADD COLUMN IF NOT EXISTS user_agent_hash TEXT;

COMMENT ON COLUMN poll_votes.user_id IS '登录用户 ID；匿名为 NULL。同一账号在同一工具下只允许一票';
COMMENT ON COLUMN poll_votes.ip_hash IS '提交端 IP 的加盐 SHA-256 摘要（不可还原），仅用于防刷审计';
COMMENT ON COLUMN poll_votes.user_agent_hash IS 'User-Agent 的加盐 SHA-256 摘要（不可还原）';

-- ── 2. 索引 ──

-- 按账号回查历史
CREATE INDEX IF NOT EXISTS idx_poll_votes_tool_user
  ON poll_votes (tool_id, user_id)
  WHERE user_id IS NOT NULL;

-- 按 session 回查（vote-check 主路径）
CREATE INDEX IF NOT EXISTS idx_poll_votes_tool_session
  ON poll_votes (tool_id, session_id);

-- 按 IP 摘要做异常集中度审计
CREATE INDEX IF NOT EXISTS idx_poll_votes_tool_ip
  ON poll_votes (tool_id, ip_hash);

-- 历史列表按时间倒序
CREATE INDEX IF NOT EXISTS idx_poll_votes_tool_created
  ON poll_votes (tool_id, created_at DESC);

-- ── 3. RLS：允许登录用户读取自己的投票（不放开他人明细） ──

DROP POLICY IF EXISTS "allow_own_read_poll_votes" ON poll_votes;
CREATE POLICY "allow_own_read_poll_votes"
  ON poll_votes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ── 4. 校验 ──
-- 执行后应能看到 3 个新列与 4 个新索引：
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'poll_votes';
--   SELECT indexname FROM pg_indexes WHERE tablename = 'poll_votes';
