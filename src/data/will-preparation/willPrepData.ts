// ── 我的遗嘱准备 · 数据源 ──
//
// 法律依据：
// - 第 1127 条：法定继承顺序
// - 第 1134—1139 条：六种遗嘱形式及各自的要件
// - 第 1140 条：见证人资格限制
// - 第 1141 条：必留份
// - 第 1142 条：数份遗嘱抵触，以最后一份为准
// - 第 1124 条：受遗赠人六十日内表示接受，逾期视为放弃
//
// 本工具只做「写之前必须想清楚的事」，不生成任何可直接签署的文书。

/* ─────────────── 一、资产盘点（只收类别，不收金额） ─────────────── */

export interface AssetSubItem {
  id: string;
  name: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  examples: string;
  /** 写遗嘱时的注意点 */
  note: string;
  /** 该类别下的明细子项（目前只有数字资产需要） */
  subItems?: AssetSubItem[];
}

/** 数字资产明细。这一类最容易被漏掉——钱在手机里，家人根本不知道。 */
export const digitalSubItems: AssetSubItem[] = [
  { id: 'wechat', name: '微信零钱与零钱通' },
  { id: 'alipay', name: '支付宝余额与余额宝' },
  { id: 'cloud', name: '云盘与照片（iCloud、网盘等）' },
  { id: 'social', name: '社交账号（微信、微博、小红书）' },
  { id: 'official', name: '公众号、视频号、自媒体账号' },
  { id: 'game', name: '游戏账号与虚拟道具' },
  { id: 'crypto', name: '虚拟货币与数字钱包' },
  { id: 'domain', name: '域名、网站与小程序' },
  { id: 'points', name: '积分、会员与预付卡余额' },
];

export const assetCategories: AssetCategory[] = [
  {
    id: 'realestate',
    name: '不动产',
    examples: '住宅、商铺、写字楼、车位、宅基地上房屋',
    note: '最常见的失效点：夫妻共同财产只能处分自己那一半。先看权证登记在谁名下。',
  },
  {
    id: 'deposit',
    name: '银行存款',
    examples: '活期、定期、大额存单、外币账户',
    note: '家人往往不知道你在哪几家银行有账户。写清开户行与账号，等于留下一份清单。',
  },
  {
    id: 'wealth',
    name: '理财与基金',
    examples: '银行理财、公募基金、信托产品',
    note: '留意是否「指定受益人」——指定了受益人的，直接由受益人取得，不归遗嘱管。',
  },
  {
    id: 'securities',
    name: '股票与证券',
    examples: 'A 股、港股、债券、证券账户资金余额',
    note: '证券账户与银行账户是两套体系，只写银行卡号查不到持仓。',
  },
  {
    id: 'equity',
    name: '公司股权与合伙份额',
    examples: '有限责任公司股权、合伙企业份额、个体工商户',
    note: '处分常受公司章程或合伙协议限制，其他股东可能有优先购买权。先查章程。',
  },
  {
    id: 'insurance',
    name: '保险',
    examples: '寿险、重疾险、年金险的保单现金价值',
    note: '区分两部分：保单现金价值可以继承；指定了受益人的保险金直接归受益人，不进遗产。',
  },
  {
    id: 'vehicle',
    name: '车辆与船舶',
    examples: '汽车、摩托车、游艇、船舶',
    note: '写明车牌号与车架号，避免同型号车辆指向不明。',
  },
  {
    id: 'collectible',
    name: '收藏与贵金属',
    examples: '字画、瓷器、邮票、纪念币、黄金白银',
    note: '价值难认定、易被转移。想给特定的人，要写到不可混淆，并留下影像记录。',
  },
  {
    id: 'digital',
    name: '数字资产',
    examples: '支付宝、微信零钱、数字人民币、虚拟货币、自媒体账号',
    note: '平台协议多不允许账号继承，遗嘱写了也可能执行不了。至少留下账号清单与交代意愿——下面单独列一栏。',
    subItems: digitalSubItems,
  },
  {
    id: 'debt',
    name: '债权与债务',
    examples: '借出的款项、应收账款、房贷、经营负债',
    note: '债务不因遗嘱而消失，继承人在遗产范围内承担。写明由谁处理，能减少扯皮。',
  },
];

/**
 * 账号交代的三条路。
 * 唯一不能越的底线：密码不写进遗嘱正文——遗嘱可能被多人翻阅、复印。
 */
export interface AccountPlan {
  id: string;
  label: string;
  /** 未选中时显示的一句话摘要 */
  brief: string;
  desc: string;
  caution: string;
}

export const accountPlans: AccountPlan[] = [
  {
    id: 'in-will',
    label: '写进遗嘱：指明由谁处理',
    brief: '有实际财产价值的部分，写清平台与绑定手机号。',
    desc: '适合有实际财产价值的部分——余额、理财、可变现的虚拟财产。写明平台名称与账号绑定的手机号，不写密码。',
    caution:
      '多数平台的用户协议不允许账号本身被继承。遗嘱能安排的是里面的财产权益和「由谁去处理」，家属仍要按平台流程申诉支取。',
  },
  {
    id: 'separate-list',
    label: '另存清单：只告诉一个人它放在哪',
    brief: '账号密码单独成册，遗嘱只写它存放于何处。',
    desc: '把账号、绑定手机号、大致余额记在一份单独的清单里，密封保存。遗嘱里只写一句「另有账号清单一份，存放于某处」。',
    caution:
      '这份清单不要放进遗嘱正文。密码和账号一旦跟着遗嘱被复印、被多人翻看，风险比便利大得多。',
  },
  {
    id: 'leave-known',
    label: '先不细究：至少让家人知道范围',
    brief: '不列明细，只说明你在哪些平台有账户。',
    desc: '不列明细，只说明「我在哪些平台有账户」，避免整整一类财产被彻底遗忘。',
    caution:
      '这是下限方案。平台对长期不活跃的账户有清理规则，拖太久可能连申诉入口都关闭，钱就真的取不出来了。',
  },
];

/* ─────────────── 二、析产判断 ─────────────── */

export interface MaritalOption {
  id: string;
  label: string;
  /** 可处分范围的默认推定 */
  scope: string;
  /** 额外提醒 */
  caution: string;
}

export const maritalOptions: MaritalOption[] = [
  {
    id: 'single',
    label: '未婚或离异未再婚',
    scope: '原则上你名下的财产均可处分，但仍需确认是否存在共有人或代持。',
    caution: '若有父母出资购房但登记在你名下，出资性质可能被主张为共有，建议先留存书面说明。',
  },
  {
    id: 'first',
    label: '初婚，配偶健在',
    scope: '婚后取得的财产原则上属于夫妻共同财产，你只能处分其中一半。',
    caution: '婚前个人财产、遗嘱或赠与合同中确定只归你的财产，仍属个人财产，可全部处分。',
  },
  {
    id: 'remarried',
    label: '再婚',
    scope: '同样适用夫妻共同财产规则，可处分范围通常为一半。',
    caution: '前段婚姻的子女、继子女的继承权边界最容易起争议，建议做公证而非自书。',
  },
  {
    id: 'widowed',
    label: '丧偶',
    scope: '先完成对已故配偶遗产的分割，属于你的部分才能写进遗嘱。',
    caution: '很多人跳过这一步，直接把「夫妻共同财产」整套写进遗嘱——这部分通常是无效的。',
  },
];

export interface CoownerCheck {
  id: string;
  label: string;
}

export const coownerChecks: CoownerCheck[] = [
  { id: 'joint', label: '财产登记在我和配偶两人名下' },
  { id: 'family', label: '有父母、兄弟姐妹或其他家庭成员共同出资' },
  { id: 'nominee', label: '有财产登记在他人名下，实际由我出资（代持）' },
  { id: 'mortgage', label: '房产或车辆尚有未还清的贷款、抵押' },
  { id: 'dispute', label: '某项财产的权属正在争议或诉讼中' },
];

/* ─────────────── 三、意愿梳理 ─────────────── */

export interface IntentCheck {
  id: string;
  label: string;
  /** 命中后的法律提示 */
  tip: string;
  level: 'info' | 'warn' | 'danger';
}

export const intentChecks: IntentCheck[] = [
  {
    id: 'outsider',
    label: '想把财产留给法定继承人以外的人',
    tip: '这属于遗赠。受遗赠人必须在知道后六十日内明确表示接受，逾期视为放弃——这个期限必须当面告知对方。',
    level: 'danger',
  },
  {
    id: 'uneven',
    label: '希望某个子女多分或少分',
    tip: '法定继承原则上均分，只有遗嘱能改变比例。但不得剥夺缺乏劳动能力又没有生活来源者的必留份。',
    level: 'warn',
  },
  {
    id: 'dependent',
    label: '有需要我抚养或赡养、且没有生活来源的人',
    tip: '必须为其保留必要份额，否则遗嘱中相应部分无效。这是法律强制规定，不能用「我的财产我做主」排除。',
    level: 'danger',
  },
  {
    id: 'minor',
    label: '继承人是未成年人',
    tip: '可以有遗嘱，但实际由监护人代为管理。建议同时指定遗产管理人，避免监护人擅自处分。',
    level: 'warn',
  },
  {
    id: 'executor',
    label: '希望有人负责执行遗嘱',
    tip: '可以指定遗嘱执行人。没有执行人时，由全体继承人共同处理，容易出现推诿。',
    level: 'info',
  },
  {
    id: 'charity',
    label: '想捐给慈善机构或公益项目',
    tip: '同样属于遗赠，适用六十日规则。建议提前与该机构沟通，确认其接受遗赠的流程。',
    level: 'warn',
  },
];

/* ─────────────── 四、形式对照 ─────────────── */

export type FormVerdict = 'ok' | 'caution' | 'no';

export interface WillForm {
  id: string;
  name: string;
  article: string;
  /** 谁书写 */
  writer: string;
  /** 见证人要求 */
  witness: string;
  /** 签名与日期 */
  signing: string;
  /** 主要风险 */
  risk: string;
  /** 推荐度标签 */
  verdict: FormVerdict;
  verdictLabel: string;
}

export const willForms: WillForm[] = [
  {
    id: 'handwritten',
    name: '自书遗嘱',
    article: '第 1134 条',
    writer: '全文由遗嘱人亲笔书写',
    witness: '不需要',
    signing: '本人签名，注明年、月、日',
    risk: '真实性只能靠笔迹与日期自证，人过世后几乎无法验证。多子女家庭一旦有人质疑，举证就是决定性的。',
    verdict: 'ok',
    verdictLabel: '成本最低',
  },
  {
    id: 'notarized',
    name: '公证遗嘱',
    article: '第 1139 条',
    writer: '由公证机构按程序办理',
    witness: '由公证机构安排',
    signing: '公证员现场见证并制作笔录',
    risk: '成本最高、流程最慢。注意：公证遗嘱已不再具有优先效力，多份遗嘱仍以最后一份为准。',
    verdict: 'ok',
    verdictLabel: '证据最稳',
  },
  {
    id: 'printed',
    name: '打印遗嘱',
    article: '第 1136 条',
    writer: '可以打印，不必亲笔',
    witness: '两个以上见证人全程在场',
    signing: '遗嘱人和见证人应当在每一页签名，注明年、月、日',
    risk: '最容易漏的是「每一页」——只在末页签名，前面几页等于没有保障。',
    verdict: 'caution',
    verdictLabel: '要件最严',
  },
  {
    id: 'scribed',
    name: '代书遗嘱',
    article: '第 1135 条',
    writer: '由见证人中的一人代书',
    witness: '两个以上见证人在场见证',
    signing: '遗嘱人、代书人、其他见证人签名，注明年、月、日',
    risk: '代书人必须是见证人之一，且不能是继承人或与继承人有利害关系的人。',
    verdict: 'caution',
    verdictLabel: '需见证人',
  },
  {
    id: 'recorded',
    name: '录音录像遗嘱',
    article: '第 1137 条',
    writer: '以录音录像形式订立',
    witness: '两个以上见证人在场见证',
    signing: '遗嘱人和见证人应在录音录像中记录姓名或肖像，以及年、月、日',
    risk: '必须在音视频里说出姓名和日期，不能只在画面里出现。录像原件务必保留。',
    verdict: 'caution',
    verdictLabel: '形式要求细',
  },
  {
    id: 'oral',
    name: '口头遗嘱',
    article: '第 1138 条',
    writer: '口头表达',
    witness: '两个以上见证人在场见证',
    signing: '无书面签名要求',
    risk: '只在危急情况下有效。危急情况消除后，若能用书面或录音录像形式立遗嘱，口头遗嘱即失效。',
    verdict: 'no',
    verdictLabel: '仅限危急',
  },
];

/** 见证人资格限制（第 1140 条） */
export const witnessDisqualified: string[] = [
  '无民事行为能力人、限制民事行为能力人，以及其他不具有见证能力的人',
  '继承人、受遗赠人本人',
  '与继承人、受遗赠人有利害关系的人（如继承人的配偶、债权人、合伙人）',
];

/* ─────────────── 五、风险自检（八条红线） ─────────────── */

export interface RedLine {
  id: string;
  label: string;
  /** 命中意味着什么 */
  consequence: string;
  severity: 'fatal' | 'serious' | 'note';
}

export const redLines: RedLine[] = [
  {
    id: 'joint-property',
    label: '我打算处分夫妻共同财产中的整套房产或全部存款',
    consequence: '涉及配偶份额的部分无效。这是房产遗嘱最高频的失效原因。',
    severity: 'fatal',
  },
  {
    id: 'not-mine',
    label: '我要写进去的财产，登记在他人名下或属于代持',
    consequence: '你无权处分不属于自己的财产，这一段写了也不生效。先确权，再写。',
    severity: 'fatal',
  },
  {
    id: 'no-signature',
    label: '我打算写完打印出来，签个名就算完成',
    consequence: '这是打印遗嘱，不是自书遗嘱。需要两个以上见证人全程在场，且每一页都要签名。',
    severity: 'fatal',
  },
  {
    id: 'no-date',
    label: '我不确定要不要写日期，或者只写年月',
    consequence: '自书遗嘱必须注明年、月、日。缺日期无法判断是否为最后一份，很可能被认定无效。',
    severity: 'fatal',
  },
  {
    id: 'dependent-heir',
    label: '有缺乏劳动能力又没有生活来源的继承人，我不打算给他留份额',
    consequence: '违反必留份规定，该部分无效。法律强制保留，不能用遗嘱排除。',
    severity: 'serious',
  },
  {
    id: 'outsider-60d',
    label: '我想把财产留给法定继承人以外的人，但没打算告诉对方',
    consequence: '受遗赠人须在知道后六十日内表示接受，逾期视为放弃。不告知，等于让他放弃。',
    severity: 'serious',
  },
  {
    id: 'witness-conflict',
    label: '我准备请子女或亲戚做见证人',
    consequence: '继承人和与继承人有利害关系的人不能做见证人，会导致代书、打印等形式无效。',
    severity: 'serious',
  },
  {
    id: 'multi-wills',
    label: '我以前写过遗嘱，但不打算处理新旧之间的关系',
    consequence: '数份遗嘱内容抵触的，以最后一份为准。旧遗嘱不销毁，会成为质疑的入口。',
    severity: 'note',
  },
];

/* ─────────────── 六、备忘模板 ─────────────── */

export const memoDisclaimer =
  '本备忘由「我的遗嘱准备」工具生成，仅用于梳理思路与沟通，不构成法律意见，也不能作为遗嘱使用。正式订立请咨询公证处或执业律师。';

export const memoNextSteps: string[] = [
  '核对每一项财产的权属凭证，确认哪些真正属于你个人',
  '把可处分范围算清楚，尤其是夫妻共同财产只写自己那一半',
  '确定继承人姓名与身份证号，避免同名歧义',
  '给数字资产单独做一份账号清单，密封另存，遗嘱里只写它的存放位置',
  '选定遗嘱形式，若是自书，准备整页亲笔抄写',
  '想好遗嘱原件放在哪里、由谁在什么情况下取出',
  '如涉及公证，提前致电当地公证处确认所需材料',
];
