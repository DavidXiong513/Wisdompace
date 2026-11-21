// ─────────────────────────────────────────────────────────────
// 八大属性 · 共享量纲
//
// 来生设计（/tools/next-life-design）与今生复盘（/tools/life-scorecard）
// 用同一组名字，面对的是同一副牌：
//   来生问「你想重新拿什么牌」 —— 命定配置，可以定制
//   今生问「手里这副牌打到几分」 —— 现状存量，落点在还能怎么打
//
// 名字一旦在两处指不同的事，用户就会拿两个分数互相比，
// 然后得出「我到底是什么水平」这种没有答案的结论。
// 所以量纲只留这一份：叫什么、测什么、能改哪一段，都从这里取。
//
// 一条硬规矩：这里只写「能自己动的部分」。
// 长相、身高、家底、智商一旦写进来，工具就从自省变成宿命论——
// 用户觉得自己已被判了定论，连能改的那半也不会再去动。
// 所以差异不靠「承认先天」来对齐，而是靠 gap 说清楚：
// 这一项不评什么，以及为什么不评。
//
// fit 记录两把尺子的关系，用来决定要不要向用户解释差异：
//   same      —— 同一条轴，只是一个问想要、一个问现状，不必解释
//   partial   —— 轴大致相同，但一边多算了先天或原生那一段
//   different —— 名字一样，量的根本不是一回事，必须说清楚
// ─────────────────────────────────────────────────────────────

export type DimensionKey =
  | 'looks'
  | 'wealth'
  | 'fame'
  | 'health'
  | 'intelligence'
  | 'family'
  | 'longevity'
  | 'spirituality';

export type DimensionFit = 'same' | 'partial' | 'different';

export type Dimension = {
  key: DimensionKey;
  name: string;
  /** 这一项到底在测什么 */
  measures: string;
  /** 这一项里能自己动的地方 —— 只写可改的，不写宿命 */
  changeable: string;
  /** 两把尺子的关系 */
  fit: DimensionFit;
  /** 差异说明：不评什么、为什么不评 */
  gap: string;
  /** 属性名下的括注，只在名字容易误导时给出 */
  note?: string;
};

export const DIMENSIONS: Dimension[] = [
  {
    key: 'looks',
    name: '颜值身材',
    measures: '体态、精力，以及你对自己身体的管理感',
    changeable: '作息、运动、饮食、精神状态，都算得清，也改得动',
    fit: 'partial',
    gap: '来生问你想长成什么样；这里只问现在这副身体你维持得如何。长相和身高不参与评分——它们不归你选。',
  },
  {
    key: 'wealth',
    name: '财富财商',
    measures: '收入结构、储蓄率，以及你对钱的理解',
    changeable: '挣多少、存多少、钱放在哪，都是可以调的结构',
    fit: 'partial',
    gap: '来生问你想有多少钱；这里问你现在的结构稳不稳。起点家底不参与评分。',
  },
  {
    key: 'fame',
    name: '名誉地位',
    measures: '专业口碑，以及别人愿意把事交给你的程度',
    changeable: '口碑是一件事一件事攒出来的，可以主动经营',
    fit: 'same',
    gap: '',
  },
  {
    key: 'health',
    name: '身心健康',
    measures: '睡眠、体检、情绪调节与恢复力',
    changeable: '睡、动、吃、查这四件事，都在你手上',
    fit: 'partial',
    gap: '来生问你想多健康；这里问你现在的恢复力。体质底子不参与评分。',
  },
  {
    key: 'intelligence',
    name: '学习能力',
    measures: '学习习惯、信息处理，把学到的迁移到新场景',
    changeable: '智力和学历大多定了，能改的是学什么、怎么学、学完能不能用',
    fit: 'partial',
    gap: '来生问你想多聪明；这里问你还学不学得动。智力和学历不参与评分。',
  },
  {
    key: 'family',
    name: '和睦家庭',
    measures: '家人关系与伴侣关系里，能不能好好说话',
    changeable: '原生家庭改不了，但这段关系现在怎么处，还是能谈的',
    fit: 'partial',
    gap: '来生从你出生算起，含原生家庭；这里只算你此刻还能经营的部分。',
  },
  {
    key: 'longevity',
    name: '长寿善终',
    measures: '对衰老与终局的准备度',
    changeable: '能活多久算不准，但体检、交代、财务安排，都能一件件做',
    fit: 'different',
    gap: '来生问你想活多久，这里问你把身后事交代清楚没有——同一个名字，量的是两件事。',
    note: '不预测寿命，只问准备',
  },
  {
    key: 'spirituality',
    name: '精神生活',
    measures: '价值锚点、自洽程度，以及遇事稳不稳',
    changeable: '不靠信仰也能练：独处、反思、把话说圆',
    fit: 'partial',
    gap: '来生叫「修行善根」，问善根多深；这里叫「精神生活」，问你稳不稳、能不能自圆其说——不问宗教归属。',
  },
];

/** 需要向用户解释差异的那几项（fit 不是 same） */
export const DIMENSIONS_WITH_GAP = DIMENSIONS.filter(d => d.fit !== 'same');
