import Link from "next/link";

const personalityTests = [
  {
    id: "mbti",
    title: "MBTI 性格测试",
    subtitle: "16型人格测试",
    description: "通过分析你的思维方式、行为偏好，帮助你了解自己的性格类型，发现内在的优势与特质。",
    icon: "🧩",
    color: "from-[#E8C872] to-[#D4A574]",
    href: "/tools/mbti-test",
    badge: "经典测评"
  },
  {
    id: "big-five",
    title: "大五人格测试",
    subtitle: "Big Five Personality",
    description: "从开放性、尽责性、外向性、宜人性、神经质五个维度，全面评估你的人格特征。",
    icon: "⭐",
    color: "from-[#C9A15A] to-[#B58A3A]",
    href: "/tools/big-five-test",
    badge: "科学权威"
  }
];

export default function PersonalityTestCards() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      {personalityTests.map((test) => (
        <Link
          key={test.id}
          href={test.href}
          className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(42,32,23,0.12)]"
        >
          {/* 背景渐变装饰 */}
          <div 
            className={`absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br ${test.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}
          />
          
          {/* 徽章 */}
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-[#F8F2E6] px-3 py-1 text-xs font-medium text-[#7A6A52]">
              {test.badge}
            </span>
          </div>

          {/* 图标 */}
          <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#F8F2E6] to-white text-3xl shadow-sm">
            {test.icon}
          </div>

          {/* 标题 */}
          <h3 className="relative text-xl font-semibold text-[#2F2A24] transition-colors group-hover:text-[#C9A15A]">
            {test.title}
          </h3>
          
          {/* 副标题 */}
          <p className="relative mt-1 text-sm font-medium text-[#8A7E6A]">
            {test.subtitle}
          </p>

          {/* 描述 */}
          <p className="relative mt-3 text-sm leading-relaxed text-[#6A6256]">
            {test.description}
          </p>

          {/* 箭头指示 */}
          <div className="relative mt-4 flex items-center text-sm font-medium text-[#C9A15A] transition-transform group-hover:translate-x-1">
            开始测试
            <svg 
              className="ml-1 h-4 w-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
