#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
心理情绪压力自测计算引擎 v3.0
支持: 情绪状态自评 + 紧张状态自评 + 生活压力事件回顾

用法:
    python calc_engine.py                    # 交互模式
    python calc_engine.py --demo             # 演示模式（使用示例数据）
"""

import sys
import json
from typing import Dict, List, Tuple, Optional


# ==================== 情绪状态自评量表配置 ====================

EMOTION_QUESTIONS = [
    "我觉得闷闷不乐，情绪低沉",
    "我觉得一天当中早晨的心情最好",           # 反向
    "我要哭或想哭",
    "我晚上睡眠不好",
    "我吃饭和平常一样多",                     # 反向
    "我与异性接触时和以往一样感到愉快",         # 反向
    "我感到体重减轻",
    "我为便秘烦恼",
    "我的心跳比平时快",
    "我无缘无故地感到疲乏",
    "我的头脑跟往常一样清楚",                 # 反向
    "我做事情象平时一样不感到困难",            # 反向
    "我坐卧不安，难以保持平静",
    "我对未来抱有希望",                       # 反向
    "我比平时容易生气激动",
    "我觉得作出决定是容易的",                 # 反向
    "我觉得自己是个有用的人，有人需要我",      # 反向
    "我的生活过得很有意思",                   # 反向
    "我觉得活着对别人来说是个负担",
    "平时感兴趣的事，我仍然照样感兴趣"        # 反向
]

# 反向计分题 (1-based题号)
EMOTION_REVERSE = [2, 5, 6, 11, 12, 14, 16, 17, 18, 20]

# ==================== 紧张状态自评量表配置 ====================

TENSION_QUESTIONS = [
    "我觉得比平时容易紧张和着急。",
    "我无缘无故地感到害怕。",
    "我容易心里烦乱或觉得惊恐。",
    "我觉得可能将要发疯。",
    "我觉得一切都很好，也不会发生什么不幸。",   # 反向
    "我手脚发抖打颤。",
    "我因为头疼、颈痛和背痛而苦恼。",
    "我觉得容易衰弱和疲乏。",
    "我觉得心平气和，并且容易安静地坐着。",       # 反向
    "我觉得心跳得很快。",
    "我因为一阵阵头晕而苦恼。",
    "我有过晕倒发作或觉得要晕倒似的。",
    "我呼气吸气都感到很容易。",                   # 反向
    "我的手脚麻木和刺痛。",
    "我因为胃痛和消化不良而苦恼。",
    "我经常要小便。",
    "我的手脚经常是干燥温暖的。",                  # 反向
    "我脸红发热。",
    "我容易入睡，并且一夜睡得很好。",              # 反向
    "我做恶梦。"
]

# 反向计分题 (1-based题号)
TENSION_REVERSE = [5, 9, 13, 17, 19]


# ==================== 计算函数 ====================

def calculate_emotion_score(answers: List[int]) -> Dict:
    """
    计算情绪状态评分
    
    Args:
        answers: 20道题的得分列表(1-4)
        
    Returns:
        包含原始分、标准分、等级等信息的字典
    """
    if len(answers) != 20:
        raise ValueError(f"情绪评估需要20道题答案，收到{len(answers)}道")
    
    raw_score = 0
    for i, score in enumerate(answers):
        q_num = i + 1
        if q_num in EMOTION_REVERSE:
            raw_score += (5 - score)
        else:
            raw_score += score
    
    standard_score = round(raw_score * 1.25)
    
    if standard_score < 40:
        level = "良好"
        level_code = 0
    elif standard_score < 50:
        level = "稍有波动"
        level_code = 1
    elif standard_score < 60:
        level = "值得关注"
        level_code = 2
    else:
        level = "建议关注"
        level_code = 3
    
    return {
        "raw": raw_score,
        "standard": standard_score,
        "level": level,
        "level_code": level_code,
        "reference_line": 40
    }


def calculate_tension_score(answers: List[int]) -> Dict:
    """
    计算紧张状态评分
    
    Args:
        answers: 20道题的得分列表(1-4)
        
    Returns:
        包含原始分、标准分、等级等信息的字典
    """
    if len(answers) != 20:
        raise ValueError(f"紧张评估需要20道题答案，收到{len(answers)}道")
    
    raw_score = 0
    for i, score in enumerate(answers):
        q_num = i + 1
        if q_num in TENSION_REVERSE:
            raw_score += (5 - score)
        else:
            raw_score += score
    
    standard_score = round(raw_score * 1.25)
    
    if standard_score < 50:
        level = "良好"
        level_code = 0
    elif standard_score < 60:
        level = "稍有波动"
        level_code = 1
    elif standard_score < 70:
        level = "值得关注"
        level_code = 2
    else:
        level = "建议关注"
        level_code = 3
    
    return {
        "raw": raw_score,
        "standard": standard_score,
        "level": level,
        "level_code": level_code,
        "reference_line": 50
    }


def calculate_assessment_level(emotion_result: Dict, tension_result: Dict, 
                               les_total_lcu: int, emotion_answers: List[int] = None, 
                               tension_answers: List[int] = None,
                               les_high_count: int = 0) -> Dict:
    """
    三维综合评估 (情绪 × 紧张 × 压力)
    
    Args:
        emotion_result: 情绪评估结果
        tension_result: 紧张评估结果
        les_total_lcu: 生活压力总LCU分数
        emotion_answers: 情绪评估原始答案
        tension_answers: 紧张评估原始答案
        les_high_count: 高LCU事件数量
        
    Returns:
        综合评估结果字典
    """
    e_code = emotion_result["level_code"]
    t_code = tension_result["level_code"]
    
    # 生活压力分级
    if les_total_lcu < 150:
        l_code = 0
        l_level = "压力较低"
    elif les_total_lcu <= 300:
        l_code = 1
        l_level = "有一定压力"
    else:
        l_code = 2
        l_level = "压力较大"
    
    # 基础等级 E×T矩阵
    base_level = 1
    
    if e_code == 0 and t_code == 0:
        base_level = 1
    elif e_code == 0 and t_code == 1:
        base_level = 2
    elif e_code == 0 and t_code >= 2:
        base_level = 3 if t_code == 2 else 4
    elif e_code == 1 and t_code <= 1:
        base_level = 2 if t_code == 0 else 3
    elif e_code == 1 and t_code >= 2:
        base_level = 3 if t_code == 2 else 4
    elif e_code >= 2:
        base_level = 4 if e_code == 2 else 4
        if e_code == 3 or t_code >= 2:
            base_level = min(base_level + 1, 5)
        if e_code == 3 and t_code >= 2:
            base_level = 5
    
    # 压力调整因子
    if l_code == 1 and base_level <= 2:
        base_level += 1
    elif l_code == 2 and base_level <= 3:
        base_level += 1
    
    # 特殊关注检测
    notes = []
    
    # 关注1: 消极想法
    if emotion_answers and len(emotion_answers) >= 19 and emotion_answers[18] >= 3:
        base_level = min(base_level + 1, 5)
        notes.append("消极想法关注: 第19题显示可能存在消极想法")
    
    # 关注2: 情绪-紧张双指标偏高
    if emotion_result["standard"] >= 50 and tension_result["standard"] >= 50:
        base_level = min(base_level + 1, 5)
        notes.append("双指标偏高: 情绪和紧张都达到值得关注以上")
    
    # 关注3: 高压叠加效应
    if les_high_count >= 3 and (e_code >= 2 or t_code >= 2):
        base_level = min(base_level + 1, 5)
        notes.append(f"高压叠加: {les_high_count}项高LCU事件 + 值得关注以上状态")
    
    # 关注4: 持续性状态
    if emotion_answers and sum(1 for x in emotion_answers if x >= 3) >= 10:
        base_level = min(base_level + 1, 5)
        notes.append("持续性状态关注: 情绪评估>=10题为高频作答")
    if tension_answers and sum(1 for x in tension_answers if x >= 3) >= 10:
        base_level = min(base_level + 1, 5)
        notes.append("持续性状态关注: 紧张评估>=10题为高频作答")
    
    final_level = max(1, min(base_level, 5))
    
    # 评估等级配置
    level_configs = {
        1: {"name": "状态良好", "icon": "😊", "color": "green", 
            "desc": "当前心理状态良好，继续保持！"},
        2: {"name": "稍有波动", "icon": "🙂", "color": "blue",
            "desc": "存在轻微波动，注意自我调节即可。"},
        3: {"name": "值得关注", "icon": "💡", "color": "yellow",
            "desc": "存在一定程度的困扰，建议关注并适当调节。"},
        4: {"name": "建议调节", "icon": "📊", "color": "orange",
            "desc": "状态值得关注，建议寻求专业咨询。"},
        5: {"name": "建议关注", "icon": "📊", "color": "orange",
            "desc": "状态需要适当关注，建议与专业人士聊聊。"}
    }
    
    config = level_configs[final_level]
    
    return {
        "level": final_level,
        "level_name": config["name"],
        "icon": config["icon"],
        "description": config["description"],
        "notes": notes,
        "matrix": f"E{e_code}xT{t_code}xL{l_code}",
        "emotion_level": emotion_result["level"],
        "tension_level": tension_result["level"],
        "les_level": l_level
    }


def generate_recommendations(assessment_level: int, emotion_level_code: int, 
                              tension_level_code: int) -> List[str]:
    """根据评估等级生成建议"""
    recs = []
    
    # 基础建议
    recs.extend([
        "保持规律的睡眠时间，每晚7-8小时",
        "每周进行3-5次有氧运动（快走、游泳、瑜伽）",
        "保持均衡营养，减少咖啡因摄入",
        "与家人朋友保持联系，不要孤立自己",
        "学习放松技巧：深呼吸、冥想或渐进式肌肉放松"
    ])
    
    # 情绪方面建议
    if emotion_level_code >= 1:
        recs.extend([
            "每天安排让自己开心的小事，培养兴趣爱好",
            "将大任务分解为小步骤，逐步完成获得成就感",
            "记录情绪日记，识别触发因素"
        ])
    
    # 紧张方面建议
    if tension_level_code >= 1:
        recs.extend([
            "练习腹式呼吸：吸气4秒-屏息4秒-呼气6秒",
            "减少信息过载，限制浏览负面新闻的时间",
            "尝试正念练习，专注于当下时刻"
        ])
    
    # 值得关注以上建议
    if assessment_level >= 4:
        recs.insert(0, "建议寻求专业心理咨询")
        recs.insert(1, "与信任的家人朋友沟通你的感受")
        recs.insert(2, "适当减少工作/学习负担，将身心健康放在首位")
    
    return recs


# ==================== 输出函数 ====================

def print_results(emotion_result: Dict, tension_result: Dict, 
                  assessment_result: Dict, les_lcu: int = 0):
    """格式化输出评估结果"""
    
    print("\n" + "=" * 70)
    print("           心理情绪压力综合评估报告")
    print("=" * 70)
    
    print("\n+-------------------------------------------------------------+")
    print("|                      评分概览                              |")
    print("+-------------------------------------------------------------+")
    print(f"|  情绪状态: {emotion_result['standard']:>3}分 (原始{emotion_result['raw']:>2}) - {emotion_result['level']:<8}     |")
    print(f"|  紧张状态: {tension_result['standard']:>3}分 (原始{tension_result['raw']:>2}) - {tension_result['level']:<8}     |")
    print(f"|  生活压力: {les_lcu}分                                    |")
    print("+-------------------------------------------------------------+")
    
    print(f"\n{'=' * 70}")
    print(f"  {assessment_result['icon']}  综合评估: 等级{assessment_result['level']} - {assessment_result['level_name']}")
    print(f"{'=' * 70}")
    print(f"  矩阵分析: {assessment_result['matrix']}")
    print(f"  描述: {assessment_result['description']}")
    
    if assessment_result['notes']:
        print(f"\n  关注点:")
        for note in assessment_result['notes']:
            print(f"     - {note}")
    
    print(f"\n  改善建议:")
    for rec in generate_recommendations(
        assessment_result['level'], 
        emotion_result['level_code'], 
        tension_result['level_code']
    ):
        print(f"     - {rec}")
    
    print("\n" + "=" * 70)
    print("  本工具仅用于自我了解参考，不能替代专业诊断")
    print("=" * 70 + "\n")


# ==================== 交互模式 ====================

def interactive_mode():
    """交互式测评模式"""
    print("\n" + "=" * 60)
    print("    心理情绪压力自测 v3.0")
    print("    情绪状态自评 + 紧张状态自评 + 生活压力回顾")
    print("=" * 60)
    
    print("\n--- 第一步：情绪状态自评 (最近一周) ---\n")
    emotion_answers = []
    for i, question in enumerate(EMOTION_QUESTIONS):
        marker = " [反向]" if (i + 1) in EMOTION_REVERSE else ""
        while True:
            try:
                ans = input(f"  Q{i+1}{question}{marker}\n    (1偶或无/2有时/3经常/4持续): ")
                score = int(ans.strip())
                if 1 <= score <= 4:
                    break
                print("    请输入1-4之间的数字")
            except ValueError:
                print("    请输入有效数字")
        emotion_answers.append(score)
    
    print("\n--- 第二步：紧张状态自评 (最近一周) ---\n")
    tension_answers = []
    for i, question in enumerate(TENSION_QUESTIONS):
        marker = " [反向]" if (i + 1) in TENSION_REVERSE else ""
        while True:
            try:
                ans = input(f"  Q{i+1}{question}{marker}\n    (1偶或无/2有时/3经常/4持续): ")
                score = int(ans.strip())
                if 1 <= score <= 4:
                    break
                print("    请输入1-4之间的数字")
            except ValueError:
                print("    请输入有效数字")
        tension_answers.append(score)
    
    print("\n--- 第三步：生活压力事件 ---\n")
    print("  (简化版：请输入过去一年经历的压力总分，如不确定可输入0)")
    while True:
        try:
            les_lcu = int(input("  压力总分: "))
            if les_lcu >= 0:
                break
        except ValueError:
            pass
    
    emotion_result = calculate_emotion_score(emotion_answers)
    tension_result = calculate_tension_score(tension_answers)
    assessment_result = calculate_assessment_level(
        emotion_result, tension_result, les_lcu,
        emotion_answers=emotion_answers, tension_answers=tension_answers
    )
    
    print_results(emotion_result, tension_result, assessment_result, les_lcu)


# ==================== 命令行模式 ====================

def cli_mode():
    """命令行参数模式"""
    import argparse
    
    parser = argparse.ArgumentParser(description='心理情绪压力自测计算引擎')
    parser.add_argument('--emotion', type=int, help='情绪评估原始分(20-80)')
    parser.add_argument('--tension', type=int, help='紧张评估原始分(20-80)')
    parser.add_argument('--les', type=int, default=0, help='生活压力总LCU分数')
    parser.add_argument('--demo', action='store_true', help='演示模式')
    args = parser.parse_args()
    
    if args.demo:
        demo_cases = [
            {"emotion": 28, "tension": 32, "les": 95, "desc": "状态良好案例"},
            {"emotion": 38, "tension": 44, "les": 200, "desc": "稍有波动+有一定压力"},
            {"emotion": 45, "tension": 48, "les": 350, "desc": "值得关注+压力较大"},
        ]
        
        for case in demo_cases:
            print(f"\n\n{'#' * 60}")
            print(f"#  演示案例: {case['desc']}")
            print(f"#{'#' * 59}")
            
            emotion_result = calculate_emotion_score(
                [min(4, max(1, case['emotion'] // 2 + (i % 3))) for i in range(20)]
            )
            tension_result = calculate_tension_score(
                [min(4, max(1, case['tension'] // 2 + ((i + 1) % 3))) for i in range(20)]
            )
            assessment_result = calculate_assessment_level(
                emotion_result, tension_result, case['les']
            )
            
            emotion_result['raw'] = case['emotion']
            emotion_result['standard'] = round(case['emotion'] * 1.25)
            tension_result['raw'] = case['tension']
            tension_result['standard'] = round(case['tension'] * 1.25)
            
            print_results(emotion_result, tension_result, assessment_result, case['les'])
        return
    
    if not args.emotion or not args.tension:
        parser.error("请提供 --emotion 和 --tension 参数，或使用 --demo 运行演示")
    
    emotion_result = calculate_emotion_score([args.emotion // 2 + 1] * 20)
    emotion_result['raw'] = args.emotion
    emotion_result['standard'] = round(args.emotion * 1.25)
    
    tension_result = calculate_tension_score([args.tension // 2 + 1] * 20)
    tension_result['raw'] = args.tension
    tension_result['standard'] = round(args.tension * 1.25)
    
    assessment_result = calculate_assessment_level(
        emotion_result, tension_result, args.les
    )
    print_results(emotion_result, tension_result, assessment_result, args.les)


# ==================== 主程序入口 ====================

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cli_mode()
    else:
        try:
            interactive_mode()
        except KeyboardInterrupt:
            print("\n\n测评已取消。感谢您的使用！")
