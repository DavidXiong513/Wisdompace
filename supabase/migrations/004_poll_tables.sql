-- 004_poll_tables.sql
-- 互动投票工具的数据持久化 + 实时聚合
-- 适用场景：匿名投票（无需登录），每人一票

-- ── 1. poll_votes：每人的投票记录 ──
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  readiness_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 同一工具 + 同一 session 只能投一次
  UNIQUE (tool_id, session_id)
);

COMMENT ON TABLE poll_votes IS '互动投票记录，每 session 一票';
COMMENT ON COLUMN poll_votes.tool_id IS '工具标识，如 community-aging-poll';
COMMENT ON COLUMN poll_votes.session_id IS '匿名用户标识，前端 localStorage 生成的 UUID';
COMMENT ON COLUMN poll_votes.answers IS '完整答案 JSON，如 {"0":"非常寄望","1":["独身","丁克"],...}';
COMMENT ON COLUMN poll_votes.readiness_score IS '0-100 养老准备度评分';

-- ── 2. poll_aggregates：预计算的选项计数 ──
CREATE TABLE IF NOT EXISTS poll_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  question_index INT NOT NULL,
  option_label TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tool_id, question_index, option_label)
);

COMMENT ON TABLE poll_aggregates IS '投票聚合计数，每选项一行';
COMMENT ON COLUMN poll_aggregates.tool_id IS '工具标识';
COMMENT ON COLUMN poll_aggregates.question_index IS '题目序号（0-indexed）';
COMMENT ON COLUMN poll_aggregates.option_label IS '选项文字（与前端一致）';
COMMENT ON COLUMN poll_aggregates.count IS '该选项被选中的总次数';

-- ── 3. 更新聚合的 trigger ──
CREATE OR REPLACE FUNCTION fn_update_poll_aggregates()
RETURNS TRIGGER AS $$
DECLARE
  q_key TEXT;
  ans_val JSONB;
  arr_val TEXT;
BEGIN
  -- 遍历 answers JSON 的每个 key（即 question_index）
  FOR q_key IN SELECT jsonb_object_keys(NEW.answers) LOOP
    ans_val := NEW.answers -> q_key;

    -- 单值：{"0": "非常寄望"}
    IF jsonb_typeof(ans_val) = 'string' THEN
      INSERT INTO poll_aggregates (tool_id, question_index, option_label, count)
      VALUES (NEW.tool_id, q_key::INT, ans_val #>> '{}', 1)
      ON CONFLICT (tool_id, question_index, option_label)
      DO UPDATE SET count = poll_aggregates.count + 1, updated_at = now();
    END IF;

    -- 多值：{"1": ["独身", "丁克"]}
    IF jsonb_typeof(ans_val) = 'array' THEN
      FOR arr_val IN SELECT jsonb_array_elements_text(ans_val) LOOP
        INSERT INTO poll_aggregates (tool_id, question_index, option_label, count)
        VALUES (NEW.tool_id, q_key::INT, arr_val, 1)
        ON CONFLICT (tool_id, question_index, option_label)
        DO UPDATE SET count = poll_aggregates.count + 1, updated_at = now();
      END LOOP;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_poll_votes_insert ON poll_votes;
CREATE TRIGGER trg_poll_votes_insert
  AFTER INSERT ON poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_poll_aggregates();

-- ── 4. RLS 策略 ──
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_aggregates ENABLE ROW LEVEL SECURITY;

-- poll_votes 只允许匿名 insert（由 API 用 service_role 写入）
CREATE POLICY "allow_public_insert_poll_votes"
  ON poll_votes FOR INSERT
  WITH CHECK (true);

-- poll_votes 禁止公开读取（隐私保护）
CREATE POLICY "no_read_poll_votes"
  ON poll_votes FOR SELECT
  USING (false);

-- poll_aggregates 允许公开读取（展示投票结果用）
CREATE POLICY "allow_public_read_poll_aggregates"
  ON poll_aggregates FOR SELECT
  USING (true);

-- poll_aggregates 只允许 trigger 内部更新（禁止直接修改）
CREATE POLICY "no_public_write_poll_aggregates"
  ON poll_aggregates FOR ALL
  USING (false)
  WITH CHECK (false);
