// ── 告别方式数据 ──
// 注意：全文避免直接使用"死""葬""尸"等字眼，用"告别""旅程""归处""安排"替代

// ── 告别仪式形式 ──

export type CeremonyFormat = {
  id: string;
  label: string;
  description: string;
  icon: string;
  tags: string[];
};

export const ceremonyFormats: CeremonyFormat[] = [
  {
    id: "living-funeral",
    label: "生前告别式",
    description: "趁自己还清醒，亲自主持一场告别派对——听朋友们对你说真心话，一起回顾这一生的精彩片段。",
    icon: "🎉",
    tags: ["潮流", "新锐"],
  },
  {
    id: "intimate-gathering",
    label: "至亲小聚",
    description: "只邀请最亲近的家人和挚友，找一个安静的地方，泡一壶好茶，聊聊那些年一起走过的日子。",
    icon: "☕",
    tags: ["温馨", "私密"],
  },
  {
    id: "celebration-of-life",
    label: "人生庆祝会",
    description: "不设灵堂、不穿黑衣，用音乐、照片和故事庆祝你这一生的精彩。放你最爱的歌，吃你最爱的菜。",
    icon: "🎊",
    tags: ["欢快", "个性化"],
  },
  {
    id: "nature-farewell",
    label: "山野告别",
    description: "在你喜欢的山间、海边或森林里，让挚友们在自然中与你道别。没有仪式感，只有风声和回忆。",
    icon: "🌲",
    tags: ["自然", "宁静"],
  },
  {
    id: "cultural-ritual",
    label: "传统仪式",
    description: "按照家乡的传统习俗，庄重而完整地完成最后的告别。这是对祖辈的致敬，也是对根脉的回归。",
    icon: "🏮",
    tags: ["传统", "庄重"],
  },
  {
    id: "zero-ceremony",
    label: "免打扰模式",
    description: "不办任何仪式，悄悄离开。把想说的话提前写好，让一切在平静中完成。",
    icon: "🌙",
    tags: ["极简", "安静"],
  },
  {
    id: "custom",
    label: "自定义",
    description: "你有自己的想法？在下方自由描述你心目中的告别方式。",
    icon: "✏️",
    tags: ["个性化"],
  },
];

// ── 安置方式（归处选择）──

export type RestingPlace = {
  id: string;
  label: string;
  description: string;
  icon: string;
  tags: string[];
  funFact?: string;
};

export const restingPlaces: RestingPlace[] = [
  {
    id: "traditional",
    label: "入土为安",
    description: "选择一块安静的墓地，立一块碑，让后人有个可以来看你的地方。",
    icon: "🪦",
    tags: ["传统", "可祭扫"],
  },
  {
    id: "columbarium",
    label: "归于静室",
    description: "骨灰安放在灵骨塔或纪念堂中，不受风雨侵蚀，安静而永恒。",
    icon: "🏛️",
    tags: ["节约土地", "永久"],
  },
  {
    id: "temple",
    label: "寺院往生",
    description: "安放在寺院中，听晨钟暮鼓，伴经声佛号。适合有佛缘的人。",
    icon: "🛕",
    tags: ["佛系", "安宁"],
  },
  {
    id: "church",
    label: "教堂安息",
    description: "安放在教堂墓园中，在十字架下安息。适合有基督教信仰的人。",
    icon: "⛪",
    tags: ["信仰", "庄严"],
  },
  {
    id: "sea",
    label: "归于大海",
    description: "将骨灰撒入大海，让生命回归最广阔的怀抱。从此，每一片海浪都是你。",
    icon: "🌊",
    tags: ["浪漫", "自由"],
    funFact: "海葬在国内多个城市已有补贴政策",
  },
  {
    id: "tree",
    label: "树葬 / 花葬",
    description: "骨灰埋在树下或花丛中，化作养分滋养新生。你的生命将以另一种形式继续生长。",
    icon: "🌳",
    tags: ["环保", "生态"],
    funFact: "多地推出免费生态葬补贴",
  },
  {
    id: "diamond",
    label: "钻石葬",
    description: "将骨灰中的碳元素提炼成人造钻石，镶嵌成戒指或项链，让亲人可以永远佩戴着你。",
    icon: "💎",
    tags: ["科技", "永恒"],
    funFact: "国外已有成熟服务，国内逐步引入",
  },
  {
    id: "cryo",
    label: "冷冻保存",
    description: "将身体在液氮中冷冻保存，期待未来医学突破后复苏。这是对科技的一份信仰。",
    icon: "🧊",
    tags: ["前沿", "未来"],
    funFact: "全球已有数百人选择冷冻保存",
  },
  {
    id: "space",
    label: "太空旅行",
    description: "将少量骨灰送入太空轨道或月球表面。从此，你在星辰之间漫游。",
    icon: "🚀",
    tags: ["科幻", "浪漫"],
    funFact: "已有公司提供太空葬服务",
  },
  {
    id: "custom",
    label: "其他方式",
    description: "你有独特的想法？在下方自由描述。",
    icon: "✏️",
    tags: ["个性化"],
  },
];

// ── 墓志铭风格 ──

export type EpitaphStyle = {
  id: string;
  label: string;
  description: string;
  examples: string[];
  icon: string;
};

export const epitaphStyles: EpitaphStyle[] = [
  {
    id: "humor",
    label: "幽默型",
    description: "用幽默化解沉重，让看到的人会心一笑",
    examples: [
      "终于可以睡个懒觉了。",
      "别急，我只是先走一步去占座。",
      "此处无人，只有故事。",
      "WiFi 信号不太好，但风景不错。",
      "我这辈子最大的遗憾是——没来得及看完那部剧。",
    ],
    icon: "😄",
  },
  {
    id: "warm",
    label: "温情型",
    description: "用温暖的话语，表达对这个世界和身边人的感恩",
    examples: [
      "谢谢你来过我的生命。",
      "爱过，活过，足矣。",
      "我曾在人间好好爱过你们。",
      "此生有你，何其有幸。",
      "把温柔留给世界，把思念留给你。",
    ],
    icon: "💛",
  },
  {
    id: "poetic",
    label: "诗意型",
    description: "用诗句和意象，为最后的告别增添一抹浪漫",
    examples: [
      "归去，也无风雨也无晴。",
      "我从山中来，回到云深处。",
      "生如夏花，逝如秋叶。",
      "风起时，我在每一缕清风里。",
      "落花不是无情物，化作春泥更护花。",
    ],
    icon: "🌸",
  },
  {
    id: "philosophy",
    label: "哲思型",
    description: "用哲理性的句子，留下对生命的终极思考",
    examples: [
      "死亡不是终点，遗忘才是。",
      "我来过，我看见，我爱过。",
      "人生如逆旅，我亦是行人。",
      "万物归尘，唯有爱不灭。",
      "活着是为了更好地告别，告别是为了更好地活着。",
    ],
    icon: "🤔",
  },
  {
    id: "minimal",
    label: "极简型",
    description: "少即是多，一个字胜过千言万语",
    examples: [
      "来过。",
      "活过。",
      "够了。",
      "谢谢。",
      "走了。",
    ],
    icon: "✨",
  },
];

// ── 遗照风格偏好 ──

export type PhotoStyle = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

export const photoStyles: PhotoStyle[] = [
  { id: "classic", label: "经典证件照", description: "正式、庄重，黑白或彩色均可", icon: "📸" },
  { id: "casual", label: "生活照", description: "一张你最自然、最开心的日常照片", icon: "😊" },
  { id: "travel", label: "旅行照", description: "在你最喜欢的地方拍的那张照片", icon: "✈️" },
  { id: "family", label: "合影", description: "和家人或朋友的合影，定格最温暖的瞬间", icon: "👨‍👩‍👧" },
  { id: "artistic", label: "艺术照", description: "画作、插画或任何你觉得能代表自己的形象", icon: "🎨" },
  { id: "young", label: "年轻时的照片", description: "留住你最意气风发的那一刻", icon: "🕺" },
  { id: "custom", label: "自定义", description: "你有其他想法，自由描述", icon: "✏️" },
];

// ── 告别主持人 ──

export type HostOption = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

export const hostOptions: HostOption[] = [
  { id: "spouse", label: "伴侣/配偶", description: "最了解你的人，但也要考虑 TA 的承受能力", icon: "💑" },
  { id: "child", label: "子女", description: "让他们为你主持最后一程，也是一种传承", icon: "👧" },
  { id: "best-friend", label: "挚友", description: "那个知道你所有糗事的人，最适合讲你的故事", icon: "🤝" },
  { id: "sibling", label: "兄弟姐妹", description: "从小一起长大的人，最懂你的来路", icon: "👫" },
  { id: "mentor", label: "师长/前辈", description: "人生路上的引路人，由他们来送你最后一程", icon: "🎓" },
  { id: "professional", label: "专业司仪", description: "交给专业的人，让一切体面而从容", icon: "🎤" },
  { id: "self", label: "自己（生前告别式）", description: "如果选择生前告别式，你可以亲自主持自己的派对", icon: "🙋" },
  { id: "custom", label: "其他", description: "你有其他想法，自由填写", icon: "✏️" },
];

// ── 背景音乐 ──

export type MusicOption = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

export const musicOptions: MusicOption[] = [
  { id: "favorite-song", label: "你最爱的一首歌", description: "那首你听了千百遍也不会腻的歌", icon: "🎵" },
  { id: "classical", label: "古典音乐", description: "安详、庄重，如莫扎特、巴赫", icon: "🎻" },
  { id: "folk", label: "民谣/民歌", description: "朴素、温暖，带着泥土的气息", icon: "🎸" },
  { id: "pop", label: "流行金曲", description: "属于你那个年代的经典旋律", icon: "🎤" },
  { id: "nature", label: "自然之声", description: "鸟鸣、海浪、风声——让自然为你送行", icon: "🌿" },
  { id: "none", label: "不需要音乐", description: "安静，就是最好的旋律", icon: "🤫" },
  { id: "custom", label: "自定义", description: "你有特别想放的歌或曲子", icon: "✏️" },
];

// ── 持久化 ──

export type FarewellStyleData = {
  ceremonyFormat: string;
  ceremonyCustom: string;
  restingPlace: string;
  restingCustom: string;
  epitaphStyle: string;
  epitaphText: string;
  photoStyle: string;
  photoCustom: string;
  host: string;
  hostCustom: string;
  music: string;
  musicCustom: string;
  additionalNotes: string;
};

const STORAGE_KEY = "wisdompace-farewell-style";

export function loadFarewellData(): FarewellStyleData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultData();
  } catch {
    return getDefaultData();
  }
}

export function saveFarewellData(data: FarewellStyleData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getDefaultData(): FarewellStyleData {
  return {
    ceremonyFormat: "",
    ceremonyCustom: "",
    restingPlace: "",
    restingCustom: "",
    epitaphStyle: "",
    epitaphText: "",
    photoStyle: "",
    photoCustom: "",
    host: "",
    hostCustom: "",
    music: "",
    musicCustom: "",
    additionalNotes: "",
  };
}
