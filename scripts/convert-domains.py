# 能力分类 7域→6域 转换脚本
# 读取 ability-data.ts，更新每项能力的 domain 和 batch

import re

TRANSFORM = {
    # id: (new_domain, new_batch)  # 说明
    # 信息处理与认知能力 (domain=0, batch=1)
    1: (0, 1),    # 观察
    2: (0, 1),    # 资料收集
    3: (0, 1),    # 持续记录
    4: (0, 1),    # 归类
    5: (0, 1),    # 处理数字 ← from 认知判断
    6: (0, 1),    # 分析 ← from 认知判断
    7: (0, 1),    # 提取概念 ← from 认知判断
    8: (0, 1),    # 归纳总结 ← from 认知判断
    9: (0, 1),    # 评估 ← from 认知判断
    16: (0, 1),   # 评测与检查 ← from 执行交付

    # 创意与审美能力 (domain=1, batch=2)
    19: (1, 2),   # 视觉化表达 ← from 表达呈现
    21: (1, 2),   # 审美能力 ← from 表达呈现
    22: (1, 2),   # 艺术特长 ← from 表达呈现
    34: (1, 2),   # 创意 ← from 适应创新

    # 执行与操作能力 (domain=2, batch=3)
    12: (2, 3),   # 执行
    13: (2, 3),   # 计算机运用
    14: (2, 3),   # 机械使用

    # 沟通与人际互动能力 (domain=3, batch=4)
    15: (3, 4),   # 校对编辑 ← from 执行交付
    17: (3, 4),   # 写作 ← from 表达呈现
    18: (3, 4),   # 表演演说 ← from 表达呈现
    20: (3, 4),   # 多语言 ← from 表达呈现
    23: (3, 4),   # 情绪管理
    24: (3, 4),   # 人际沟通
    25: (3, 4),   # 团队合作
    26: (3, 4),   # 谈判协商
    27: (3, 4),   # 客户服务
    28: (3, 4),   # 销售
    29: (3, 4),   # 教导指点
    30: (3, 4),   # 顾问与咨询

    # 管理与规划能力 (domain=4, batch=5)
    11: (4, 5),   # 决策 ← from 认知判断
    35: (4, 5),   # 时间管理
    36: (4, 5),   # 多任务管理
    37: (4, 5),   # 计划组织
    38: (4, 5),   # 监控推进
    39: (4, 5),   # 预算
    40: (4, 5),   # 事务管理
    41: (4, 5),   # 授权
    42: (4, 5),   # 领导力

    # 适应与问题解决能力 (domain=5, batch=6)
    10: (5, 6),   # 预见 ← from 认知判断
    31: (5, 6),   # 快速适应
    32: (5, 6),   # 处理模糊问题
    33: (5, 6),   # 临场发挥
}

# 新的 6 大能力域定义
NEW_DOMAINS = [
    ('📊', '信息处理与认知能力', '收集、分析、解读信息的底层能力'),
    ('🎨', '创意与审美能力', '产生新想法、呈现美感、激发灵感'),
    ('⚡', '执行与操作能力', '动手执行、工具使用、按规操作'),
    ('🤝', '沟通与人际互动能力', '传递信息、建立连接、协作影响'),
    ('📋', '管理与规划能力', '整合资源、制定计划、推进目标'),
    ('🔄', '适应与问题解决能力', '应对变化、处理模糊、突破困境'),
]

NEW_BATCH_NAMES = ['信息处理与认知能力', '创意与审美能力', '执行与操作能力',
                   '沟通与人际互动能力', '管理与规划能力', '适应与问题解决能力']

# 读取源文件
with open('src/lib/ability-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换 DOMAINS 定义
old_domains = '''// === 7大能力域定义 ===
export const DOMAINS: Domain[] = [
  { icon: '📁', name: '信息整理力', desc: '从观察、收集到归类归档，这些能力帮助你高效处理信息输入' },
  { icon: '🧠', name: '认知判断力', desc: '分析、评估、决策，这些能力决定了你思考和判断的质量' },
  { icon: '⚡', name: '执行交付力', desc: '从计划到成果的落地能力，决定你能否把想法变成现实' },
  { icon: '🎨', name: '表达呈现力', desc: '写作、演讲、视觉化，这些能力帮助你把想法有效传递给他人' },
  { icon: '🤝', name: '人际影响力', desc: '沟通、协调、服务，这些能力决定你与他人的协作效能' },
  { icon: '🔄', name: '适应创新力', desc: '适应变化、持续学习、创新思维，这些能力帮助你在不确定性中保持竞争力' },
  { icon: '📋', name: '组织领导力', desc: '规划、管理、领导团队，这些能力决定了你推动更大范围事情的能力' },
];'''

new_domains_text = '''// === 6大能力域定义 ===
export const DOMAINS: Domain[] = [
  { icon: '📊', name: '信息处理与认知能力', desc: '收集、分析、解读信息，这是所有能力的认知基石' },
  { icon: '🎨', name: '创意与审美能力', desc: '产生新想法、呈现美感，这些能力让产出拥有灵魂和温度' },
  { icon: '⚡', name: '执行与操作能力', desc: '动手执行、工具使用，这些能力决定你能否把想法落地为成果' },
  { icon: '🤝', name: '沟通与人际互动能力', desc: '传递信息、建立连接，这些能力决定了你与他人的协作效能' },
  { icon: '📋', name: '管理与规划能力', desc: '整合资源、制定计划，这些能力决定你推动更大范围事情的能力' },
  { icon: '🔄', name: '适应与问题解决能力', desc: '应对变化、处理不确定，这些能力帮助你在模糊中保持前行' },
];'''

content = content.replace(old_domains, new_domains_text)

# 修改每项能力的 domain 和 batch 字段
# RAW_ABILITIES 的格式: [id,"name","def",domain,batch,...]
# domain 是第 4 个字段 (index 3), batch 是第 5 个字段 (index 4)

lines = content.split('\n')
new_lines = []
for line in lines:
    # 匹配类似: [1,"观察","以科学的方法...",0,1,...
    m = re.match(r'(\s*\[)(\d+),(\s*"[^"]*",\s*"[^"]*",\s*)(\d+),(\s*)(\d+)(,.*)', line)
    if m:
        ability_id = int(m.group(2))
        if ability_id in TRANSFORM:
            new_domain, new_batch = TRANSFORM[ability_id]
            prefix = m.group(1) + m.group(2) + ',' + m.group(3)
            rest = m.group(7)
            # Preserve spacing style
            new_line = f'{prefix}{new_domain},{m.group(5)}{new_batch}{rest}'
            new_lines.append(new_line)
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)

content = '\n'.join(new_lines)

# 更新注释中的批次数
content = content.replace(
    '// === Batch 1: 信息整理力 (domain 0) ===',
    '// === Batch 1: 信息处理与认知能力 (domain 0) ==='
)
content = content.replace(
    '// === Batch 2: 认知判断力 (domain 1) ===',
    '// === Batch 2: 创意与审美能力 (domain 1) ==='
)
content = content.replace(
    '// === Batch 3: 执行交付力 (domain 2) ===',
    '// === Batch 3: 执行与操作能力 (domain 2) ==='
)
content = content.replace(
    '// === Batch 4: 表达呈现力 (domain 3) ===',
    '// === Batch 4: 沟通与人际互动能力 (domain 3) ==='
)
content = content.replace(
    '// === Batch 5: 人际影响力 (domain 4) ===',
    '// === Batch 5: 管理与规划能力 (domain 4) ==='
)
content = content.replace(
    '// === Batch 6: 适应创新力 (domain 5) ===',
    '// === Batch 6: 适应与问题解决能力 (domain 5) ==='
)

# 移除旧的 Batch 7 注释
content = content.replace(
    '  // === Batch 7: 组织领导力 (domain 6) ===\n',
    ''
)

# 更新注释中的 7→6
content = content.replace(
    '  // 7大能力域统计',
    '  // 6大能力域统计'
)

# 写入文件
with open('src/lib/ability-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("转换完成！")
print("已更新 42 项能力的 domain 和 batch 分配")
print("已更新 DOMAINS 数组 (7→6)")
print("")

# 验证：统计每个新 domain 的能力数
import json
print("=== 新分类统计 ===")
for d_idx, (icon, name, desc) in enumerate(NEW_DOMAINS):
    count = sum(1 for v in TRANSFORM.values() if v[0] == d_idx)
    print(f"  {icon} {name}: {count}项")

print(f"\n=== 总能力数: {len(TRANSFORM)} 项 ===")
