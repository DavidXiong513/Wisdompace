// ─────────────────────────────────────────────────────────────
// 八大属性 · 共享量纲
//
// 来生设计（/tools/next-life-design）与今生复盘（/tools/life-scorecard）
// 用同一组名字，面对的是同一副牌：
//   来生问「你想重新拿什么牌」 —— 命定配置，可以定制
//   今生问「手里这副牌打到几分」 —— 现状存量，含先天，但还能往上走
//
// 名字一旦在两处指不同的事，用户就会拿两个分数互相比，
// 然后得出「我到底是什么水平」这种没有答案的结论。
// 所以量纲只留这一份：叫什么、测什么、先天占多大比重，都从这里取。
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
  /** 先天成分：发牌时就定下、不由你选的那部分 */
  given: string;
  /** 两把尺子的关系 */
  fit: DimensionFit;
  /** 差异说明：fit 不是 same 时，用一句话讲清差在哪 */
  gap: string;
  /** 属性名下的括注，只在名字容易误导时给出 */
  note?: string;
};

export const DIMENSIONS: Dimension[] = [
  {
    key: 'looks',
    name: '颜值身材',
    measures: '你现在的样子：底子，加上你把它维持成什么样',
    given: '长相和身高是发牌时就定下的，你决定的是它往哪走',
    fit: 'same',
    gap: '',
  },
  {
    key: 'wealth',
    name: '财富财商',
    measures: '你手上的钱，以及你驾驭它的能力',
    given: '起点家底不是你能选的',
    fit: 'same',
    gap: '',
  },
  {
    key: 'fame',
    name: '名誉地位',
    measures: '别人愿意把事交给你到什么程度',
    given: '出身的圈层决定起点，不决定终点',
    fit: 'same',
    gap: '',
  },
  {
    key: 'health',
    name: '身心健康',
    measures: '身体和情绪现在能扛住多少',
    given: '体质有先天差异，底子薄不等于走不远',
    fit: 'same',
    gap: '',
  },
  {
    key: 'intelligence',
    name: '学习能力',
    measures: '你现在还能学会多少新东西',
    given: '天资与早年教育已经定了，能改的是之后的斜率',
    fit: 'partial',
    gap: '来生问的是你想多聪明，这里问的是你还在不在学——两件事相关，但不是同一件。',
  },
  {
    key: 'family',
    name: '和睦家庭',
    measures: '现在这段家人关系，能不能好好说话',
    given: '原生家庭是你没得选的那一段',
    fit: 'partial',
    gap: '来生从你出生算起，这里只算你此刻还能经营的部分。',
  },
  {
    key: 'longevity',
    name: '长寿善终',
    measures: '对衰老与终局的准备度',
    given: '能活多久没人算得准，所以这一项不问寿命',
    fit: 'different',
    gap: '来生问你想活多久，这里问你把身后事交代清楚没有——同一个名字，量的是两件事。',
    note: '不预测寿命，只问准备',
  },
  {
    key: 'spirituality',
    name: '修行善根',
    measures: '面对无常时，你稳不稳',
    given: '善根深浅有天生成分',
    fit: 'partial',
    gap: '来生问的是善根多深，这里问的是遇事稳不稳——后者更能练。',
  },
];

/** 需要向用户解释差异的那几项（fit 不是 same） */
export const DIMENSIONS_WITH_GAP = DIMENSIONS.filter(d => d.fit !== 'same');
