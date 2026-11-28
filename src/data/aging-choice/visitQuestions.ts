/**
 * 参访提问清单
 *
 * 设计原则：
 * 1. 问的是「能不能兑现」，不是「好不好」——宣传册上的形容词不用问。
 * 2. 每组都配一句「为什么问」，让用户知道听到什么答案算过关。
 * 3. 不写任何价格数字，价格相关的问题只问结构（与 pricingNotice 一致）。
 */

export interface VisitQuestion {
  id: string;
  text: string;
  /** 听到什么算过关 */
  goodAnswer: string;
}

export interface VisitGroup {
  key: string;
  title: string;
  /** 为什么问这一组 */
  why: string;
  questions: VisitQuestion[];
}

export const visitGroups: VisitGroup[] = [
  {
    key: 'license',
    title: '资质与监管',
    why: '这一组决定它是不是「能合法收住老人」的机构，问不出来后面都不用谈。',
    questions: [
      {
        id: 'license-1',
        text: '你们的执业许可证和民政备案编号是多少？可以看一下原件吗？',
        goodAnswer: '能当场拿出，编号可查；含糊其辞或说「在总部」就要警惕。',
      },
      {
        id: 'license-2',
        text: '近三年有没有被民政、卫健或市场监管处罚过？',
        goodAnswer: '能明确回答，并说明整改了什么；答「从来没有」反而要多问一句。',
      },
      {
        id: 'license-3',
        text: '护理等级是你们自己评，还是有第三方参与？多久复评一次？',
        goodAnswer: '有明确评估流程和复评周期；只由销售口头判断的不算。',
      },
    ],
  },
  {
    key: 'staffing',
    title: '护理人力',
    why: '入住体验的差别，八成来自「人够不够」，不是「装修好不好」。',
    questions: [
      {
        id: 'staffing-1',
        text: '一个护理员负责几位老人？夜班有几个人？',
        goodAnswer: '能给出具体数字和班次；只说「我们配得很足」等于没回答。',
      },
      {
        id: 'staffing-2',
        text: '有没有常驻护士？护士是几班倒？夜间有护士在吗？',
        goodAnswer: '护理院应有护士在岗；养老院若说「白天有」，夜间急救能力就要打折。',
      },
      {
        id: 'staffing-3',
        text: '夜里查房几次？有没有记录可以看？',
        goodAnswer: '能拿出查房记录本或系统记录。',
      },
    ],
  },
  {
    key: 'medical',
    title: '医疗与急救',
    why: '这是养老院和护理院最实质的差别，也是最容易被话术模糊的地方。',
    questions: [
      {
        id: 'medical-1',
        text: '老人突然倒下，你们的处置流程是什么？几分钟内谁到场？',
        goodAnswer: '能说清「谁先到、做什么、多久送医」；只说「马上打 120」说明没有院内急救能力。',
      },
      {
        id: 'medical-2',
        text: '有没有内设医疗机构？能不能吸氧、导尿、换药、做管路维护？',
        goodAnswer: '有执业许可的医务室/护理院才能做；做不了就要按「定期跑医院」来规划。',
      },
      {
        id: 'medical-3',
        text: '送医是打 120 还是有合作医院？谁陪同、费用谁出？',
        goodAnswer: '有明确的合作医院和陪同机制，费用规则事先说清。',
      },
    ],
  },
  {
    key: 'dementia',
    title: '认知照护（如需要）',
    why: '失智照护的关键不是「有没有专区」，而是「怎么防走失、怎么用约束」。',
    questions: [
      {
        id: 'dementia-1',
        text: '有没有独立的记忆照护专区？是不是封闭管理？',
        goodAnswer: '有独立区域和门禁；混住在普通楼层就要再考虑。',
      },
      {
        id: 'dementia-2',
        text: '走失风险怎么防？有没有定位设备或门禁记录？',
        goodAnswer: '有具体措施和记录，而不是「我们看得紧」。',
      },
      {
        id: 'dementia-3',
        text: '会不会使用约束？什么情况下用、谁批准、怎么记录？',
        goodAnswer: '有明确的约束使用规范与记录；答「我们从不约束」要追问夜间怎么处理。',
      },
    ],
  },
  {
    key: 'contract',
    title: '费用与合同',
    why: '价格会变，条款不会天天变——合同比报价更值得逐字看。',
    questions: [
      {
        id: 'contract-1',
        text: '合同期多久？中途退住怎么结算？',
        goodAnswer: '退住结算规则写进合同，而不是口头承诺。',
      },
      {
        id: 'contract-2',
        text: '哪些是额外收费？纸尿裤、陪诊、洗衣、空调、取暖怎么算？',
        goodAnswer: '能列出完整清单；说「基本都含」的，多半在合同附件里另算。',
      },
      {
        id: 'contract-3',
        text: '调价需要提前多久通知？有没有涨幅上限？',
        goodAnswer: '写进合同的通知期与调价机制；只靠口头「不会乱涨」不算。',
      },
    ],
  },
  {
    key: 'daily',
    title: '日常生活',
    why: '住进去以后，日子是由作息、饮食、探视这些小事组成的。',
    questions: [
      {
        id: 'daily-1',
        text: '一日作息怎么安排？每天有没有户外活动？',
        goodAnswer: '有具体时间表；「看天气和老人意愿」通常意味着没有安排。',
      },
      {
        id: 'daily-2',
        text: '家属探视有时间和次数限制吗？能不能陪餐？',
        goodAnswer: '限制合理且写进规定；过度限制探视是风险信号。',
      },
      {
        id: 'daily-3',
        text: '老人能自己外出吗？需要什么手续？',
        goodAnswer: '有清晰的外出请假与陪同规则。',
      },
    ],
  },
  {
    key: 'retention',
    title: '人员稳定',
    why: '护理员换得勤，老人就要反复适应陌生人——这件事比价格更影响晚年质量。',
    questions: [
      {
        id: 'retention-1',
        text: '护理员平均在岗多久？去年大概走了多少人？',
        goodAnswer: '能给出大致数字；说「我们很稳定」但答不出年限，基本不稳。',
      },
      {
        id: 'retention-2',
        text: '新护理员上岗前培训多久？有没有考核？',
        goodAnswer: '有岗前培训与考核记录。',
      },
      {
        id: 'retention-3',
        text: '护理员是机构直聘还是外包？',
        goodAnswer: '直聘的管理链条更短；外包要问清投诉找谁。',
      },
    ],
  },
  {
    key: 'risk',
    title: '风险与纠纷',
    why: '出过事不可怕，可怕的是「从来没出过事」这种回答。',
    questions: [
      {
        id: 'risk-1',
        text: '过去一年发生过跌倒、走失或误服吗？之后改了什么？',
        goodAnswer: '能说出具体事件与整改措施；说「一次都没有」要么不真实，要么不上报。',
      },
      {
        id: 'risk-2',
        text: '出现纠纷走什么流程？有没有第三方调解渠道？',
        goodAnswer: '有明确流程和第三方渠道。',
      },
      {
        id: 'risk-3',
        text: '公共区域有监控吗？家属能不能申请调阅？',
        goodAnswer: '有监控且有调阅规则；一概拒绝调阅要警惕。',
      },
    ],
  },
];

/** 现场技巧：比问题本身更容易被忽略 */
export const visitTips: string[] = [
  '别在工作日上午去——那是人手最齐的时候。周末傍晚最能看出真实配置。',
  '要求看正在使用中的卫生间和餐厅，不要只看样板间。',
  '随机找一位在院家属聊两句，比看十本宣传册有用。',
  '问一句「如果现在签，最快什么时候能入住」——空床多的机构会立刻给你让价空间。',
  '把「口头承诺」当场记下来，并问一句：这条会写进合同吗？',
];

export const visitTotalCount = visitGroups.reduce(
  (n, g) => n + g.questions.length,
  0
);
