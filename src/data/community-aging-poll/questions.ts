/**
 * 新型社群养老 · 互动投票 —— 题目定义
 *
 * 单独抽出来，供投票页（客户端）与统计页（服务端）共用，
 * 避免题目文案在两处各维护一份、改动后对不上。
 */

export interface PollQuestion {
  /** 与 answers 的 key 对应：q0 → answers[0] */
  id: string;
  chapter: string;
  chapterIcon: string;
  text: string;
  multi: boolean;
  maxSelect?: number;
  options: string[];
}

export const POLL_QUESTIONS: PollQuestion[] = [
  {
    id: 'q0',
    chapter: '篇章一：养老期望',
    chapterIcon: '🏠',
    text: '你目前对“子女养老”寄予希望的程度？',
    multi: false,
    options: ['非常寄望', '比较寄望', '一般', '不太寄望', '完全不寄望'],
  },
  {
    id: 'q1',
    chapter: '篇章一：养老期望',
    chapterIcon: '🏠',
    text: '你的养老处境更贴合以下哪些选项？',
    multi: true,
    options: [
      '独身',
      '丁克',
      '子女海外',
      '子女去世',
      '亲子关系破裂',
      '子女能力不足',
      '有子女在身边且关系良好',
    ],
  },
  {
    id: 'q2',
    chapter: '篇章二：社群认知',
    chapterIcon: '🤝',
    text: '你之前了解过“社群养老”这个概念吗？',
    multi: false,
    options: ['完全没听过', '听说过但不了解', '有一定了解', '非常了解甚至在实践中'],
  },
  {
    id: 'q3',
    chapter: '篇章二：社群认知',
    chapterIcon: '🤝',
    text: '你对“非血缘互助养老”这件事的态度是？',
    multi: false,
    options: ['非常期待', '愿意尝试', '不确定', '有顾虑', '不认同'],
  },
  {
    id: 'q4',
    chapter: '篇章三：挑战与期待',
    chapterIcon: '⚡',
    text: '你认为新型社群养老面临的最大挑战是什么？（限选3项）',
    multi: true,
    maxSelect: 3,
    options: [
      '信任建立困难',
      '责任界定不明',
      '经济成本分摊',
      '生活习惯差异',
      '缺乏法律保障',
      '找不到志同道合的人',
    ],
  },
  {
    id: 'q5',
    chapter: '篇章三：挑战与期待',
    chapterIcon: '⚡',
    text: '你愿意为未来的社群养老付出什么？',
    multi: true,
    options: [
      '投入时间参与活动',
      '贡献金钱建立基金',
      '学习照护技能',
      '开放自己的空间',
      '目前还不想考虑',
    ],
  },
  {
    id: 'q6',
    chapter: '篇章四：技术接受度',
    chapterIcon: '🤖',
    text: '你对具身AI机器人参与养老照护的态度？',
    multi: false,
    options: ['非常接受', '可以尝试', '不确定', '有顾虑', '不能接受'],
  },
  {
    id: 'q7',
    chapter: '篇章四：技术接受度',
    chapterIcon: '🤖',
    text: '你最希望AI机器人在养老中扮演什么角色？',
    multi: true,
    options: [
      '日常陪伴聊天',
      '健康监测提醒',
      '紧急情况报警',
      '家务辅助',
      '行动辅助',
      '不需要AI介入',
    ],
  },
];

/** 便于按题号取题 */
export function getQuestion(index: number): PollQuestion | undefined {
  return POLL_QUESTIONS[index];
}
