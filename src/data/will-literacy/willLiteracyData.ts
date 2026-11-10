/**
 * 遗嘱科普内容框的数据源。
 *
 * 定位：不是又一个工具，也不是又一份模板，而是把「要不要现在动手」
 * 这个决定摆到用户面前，并说清一份遗嘱到底管得了什么、管不了什么。
 *
 * 法律依据均出自《民法典》继承编：
 * - 第 1127 条：法定继承顺序（配偶、子女、父母为第一顺序）
 * - 第 1128 条：代位继承
 * - 第 1134 条：自书遗嘱须全文亲笔书写、签名、注明年月日
 * - 第 1141 条：必留份
 * - 第 1142 条：数份遗嘱内容抵触的，以最后一份为准
 * - 第 1124 条：受遗赠人应在知道受遗赠后六十日内表示接受，逾期视为放弃
 */

export type ReadinessTone = 'act' | 'soon' | 'hold';

export interface ReadinessOption {
  id: string;
  label: string;
  tone: ReadinessTone;
  feedback: string;
}

export const readinessPrompt = '如果今天就要决定，你的答案是？';

export const readinessOptions: ReadinessOption[] = [
  {
    id: 'ready',
    label: '愿意，我想尽快写',
    tone: 'act',
    feedback:
      '那第一件事不是找模板，是把「有什么」和「给谁」写下来。这两件事定了，格式问题十分钟就能定。',
  },
  {
    id: 'unsure',
    label: '想写，但不知道从哪下手',
    tone: 'soon',
    feedback:
      '卡住的地方通常不是不会写，是没想清楚「给谁」。先只回答一个问题：如果只能留给一个人，你会选谁？答案出来了，其余的事情就顺了。',
  },
  {
    id: 'later',
    label: '暂时不写，觉得还早',
    tone: 'hold',
    feedback:
      '「还早」在大多数情况下是对的，不必因为看了这一页就焦虑。但有几类情况会把「还早」变成「来不及」——下一问可以对照一下。',
  },
  {
    id: 'never',
    label: '我打算不写，让法律默认分',
    tone: 'hold',
    feedback:
      '这也是一种安排，不写不等于没交代。法定继承的第一顺序是配偶、子女、父母，原则上均分。如果这正好是你要的结果，确实可以不写；但只要有一个人、一份财产不符，就需要一份遗嘱把它拨回来。',
  },
];

export interface UrgencySignal {
  id: string;
  label: string;
  why: string;
}

export const urgencySignals: UrgencySignal[] = [
  {
    id: 'remarry',
    label: '再婚，或配偶在前段婚姻里有子女',
    why: '继子女与亲生子女的继承边界，是实践中最容易起争议的一处。',
  },
  {
    id: 'nonmarital',
    label: '有非婚生子女、养子女，或有扶养关系的继子女',
    why: '他们同样是第一顺序继承人，但往往需要额外证据证明关系。一份遗嘱能省掉这一步。',
  },
  {
    id: 'outsider',
    label: '想把财产留给法定继承人以外的人',
    why: '这叫遗赠。受遗赠人必须在知道后六十日内明确表示接受，逾期视为放弃——这个期限很多人不知道。',
  },
  {
    id: 'complex',
    label: '名下不止一套房，或有公司股权、合伙份额',
    why: '这类财产处分受限，价值也容易算错，必须先分清哪些份额真正属于你。',
  },
  {
    id: 'grandchild',
    label: '有子女先于你离世，留下孙辈',
    why: '孙辈一般不在第一顺序里，只有发生代位继承时才进来。遗嘱可以把这件事说清楚。',
  },
  {
    id: 'uneven',
    label: '希望某个子女多分，或有意少分',
    why: '法定继承原则上是均分，只有遗嘱能改变比例。但不得剥夺缺乏劳动能力又没有生活来源者的必留份。',
  },
];

export type ScopeTone = 'yes' | 'partial' | 'no';

export interface ScopeRow {
  matter: string;
  owner: string;
  tone: ScopeTone;
  note: string;
}

export const scopeRows: ScopeRow[] = [
  {
    matter: '财产给谁、给多少、某件旧物归谁',
    owner: '遗嘱',
    tone: 'yes',
    note: '这是遗嘱最核心的功能。但要写到不可混淆——「我那块表」不行，「书房书桌左边第一个抽屉里那块钢带表」才行。',
  },
  {
    matter: '失能之后，谁替我做决定',
    owner: '意定监护',
    tone: 'no',
    note: '这是「我还活着但说不了话」时的授权，遗嘱只在身后生效，管不到这一段。',
  },
  {
    matter: '临终要不要插管、要不要抢救',
    owner: '生前预嘱',
    tone: 'no',
    note: '写进遗嘱也来不及生效——它属于医疗意愿，形式与效力另有一套规则。',
  },
  {
    matter: '遗体捐献、骨灰怎么处理、要不要办仪式',
    owner: '遗嘱里可以写，但不产生强制力',
    tone: 'partial',
    note: '实践中最终要靠家属配合执行。想确保落实，最好生前就当面说清楚，而不是只写在纸上。',
  },
  {
    matter: '保险金、指定了受益人的理财',
    owner: '保险合同，不经继承程序',
    tone: 'no',
    note: '受益人直接取得。遗嘱里另作安排与之冲突时，以合同为准。',
  },
  {
    matter: '社交账号、云盘、游戏资产',
    owner: '平台用户协议',
    tone: 'partial',
    note: '多数平台不认遗嘱，写了也可能执行不了。至少把账号清单和处理意愿留下来。',
  },
];

export const closingNotes: string[] = [
  '自书遗嘱要求全文亲笔书写。所以在原文上涂改、增删，很容易被质疑——稳妥的做法是重新抄一份，注明新的日期。',
  '写完放在哪里、让谁在什么时候找到它，这件事和写同样重要。放在只有你知道的地方，等于没写。',
  '本页只做科普，不生成任何文书。真要动笔，形式上的细节建议找公证处或律师核一遍。',
];
