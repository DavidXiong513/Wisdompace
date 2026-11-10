-- 006_poll_aggregates_delete.sql
-- 补齐聚合计数的回退链路
--
-- 背景：004 只给 poll_votes 加了 AFTER INSERT 触发器，
-- 删除一条投票时 poll_aggregates 的计数不会减少，删除越多偏得越远。
-- 联调清理测试票、或将来做「撤销投票」都会遇到这个问题。
--
-- 本迁移做两件事：
--   1. 新增 AFTER DELETE 触发器，删除投票时同步扣减每个选项的计数
--   2. 提供 fn_rebuild_poll_aggregates()，用于一次性把计数重算对齐

-- ── 1. 删除时扣减 ──
CREATE OR REPLACE FUNCTION fn_decrement_poll_aggregates()
RETURNS TRIGGER AS $$
DECLARE
  q_key TEXT;
  ans_val JSONB;
  arr_val TEXT;
BEGIN
  FOR q_key IN SELECT jsonb_object_keys(OLD.answers) LOOP
    ans_val := OLD.answers -> q_key;

    -- 单值：{"0": "非常寄望"}
    IF jsonb_typeof(ans_val) = 'string' THEN
      UPDATE poll_aggregates
         SET count = GREATEST(count - 1, 0),
             updated_at = now()
       WHERE tool_id = OLD.tool_id
         AND question_index = q_key::INT
         AND option_label = ans_val #>> '{}';
    END IF;

    -- 多值：{"1": ["独身", "丁克"]}
    IF jsonb_typeof(ans_val) = 'array' THEN
      FOR arr_val IN SELECT jsonb_array_elements_text(ans_val) LOOP
        UPDATE poll_aggregates
           SET count = GREATEST(count - 1, 0),
               updated_at = now()
         WHERE tool_id = OLD.tool_id
           AND question_index = q_key::INT
           AND option_label = arr_val;
      END LOOP;
    END IF;
  END LOOP;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_poll_votes_delete ON poll_votes;
CREATE TRIGGER trg_poll_votes_delete
  AFTER DELETE ON poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION fn_decrement_poll_aggregates();

-- ── 2. 一键重算（清理脚本或修数后调用） ──
-- 用法：select fn_rebuild_poll_aggregates('community-aging-poll');
CREATE OR REPLACE FUNCTION fn_rebuild_poll_aggregates(p_tool_id TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM poll_aggregates WHERE tool_id = p_tool_id;

  INSERT INTO poll_aggregates (tool_id, question_index, option_label, count)
  SELECT
    pv.tool_id,
    (kv.key)::INT AS question_index,
    opt.label,
    COUNT(*)
  FROM poll_votes pv
  CROSS JOIN LATERAL jsonb_each(pv.answers) AS kv(key, val)
  CROSS JOIN LATERAL (
    SELECT jsonb_array_elements_text(kv.val) AS label
     WHERE jsonb_typeof(kv.val) = 'array'
    UNION ALL
    SELECT kv.val #>> '{}'
     WHERE jsonb_typeof(kv.val) = 'string'
  ) AS opt
  WHERE pv.tool_id = p_tool_id
  GROUP BY pv.tool_id, (kv.key)::INT, opt.label;
END;
$$ LANGUAGE plpgsql;
