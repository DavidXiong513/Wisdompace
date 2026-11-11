// ── 遗嘱模板库 · 科普数据 ──
// 自书遗嘱的双刃剑：同一件事，在不同家庭里意义相反。

export type TradeoffRow = {
  /** 有利的一面 */
  pro: string;
  /** 同一件事在另一侧的含义 */
  con: string;
};

export const selfWrittenTradeoffs: TradeoffRow[] = [
  {
    pro: '零成本，不需要见证人，也不需要公证',
    con: '没有见证人，就无法证明订立时神志清醒、未受胁迫',
  },
  {
    pro: '最私密，不必让任何人提前知道',
    con: '保管没有可信的第三方，藏起来常常等于不存在',
  },
  {
    pro: '随时可以改，多份以最后一份为准',
    con: '真实性只能靠笔迹鉴定，而老人晚年的笔迹往往比不了',
  },
  {
    pro: '独生子女家庭，基本够用',
    con: '多子女家庭一旦有人质疑，举证就是决定性的',
  },
];

/** 家庭结构 → 推荐形式 */
export type ScenarioVerdict = 'ok' | 'caution' | 'no';

export type FamilyScenario = {
  situation: string;
  verdict: ScenarioVerdict;
  verdictLabel: string;
  note: string;
};

export const familyScenarios: FamilyScenario[] = [
  {
    situation: '独生子女，关系和睦',
    verdict: 'ok',
    verdictLabel: '够用',
    note: '亲笔写全文、签名、注明年月日，自己收好，并告诉家人存放位置。',
  },
  {
    situation: '多子女，关系一般',
    verdict: 'caution',
    verdictLabel: '风险高',
    note: '建议做公证；至少配合录音录像记录订立过程，留下时间与在场人。',
  },
  {
    situation: '再婚，或有前婚子女',
    verdict: 'no',
    verdictLabel: '不建议',
    note: '必须公证，并且先析产——可处分的只有属于你的那一部分。',
  },
  {
    situation: '房产属于夫妻共同财产',
    verdict: 'no',
    verdictLabel: '部分无效',
    note: '遗嘱只能处分自己那一半。写整套房，整段都可能被认定无效。',
  },
  {
    situation: '想留给法定继承人以外的人',
    verdict: 'no',
    verdictLabel: '不建议',
    note: '这属于遗赠。受遗赠人须在知道后六十日内表示接受，逾期视为放弃。',
  },
  {
    situation: '财产有代持、抵押或权属争议',
    verdict: 'no',
    verdictLabel: '先理清',
    note: '权属没落地之前写遗嘱，等于把争议写进文书里。',
  },
];
