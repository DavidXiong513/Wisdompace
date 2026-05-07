import type { HobbyCategory, InterestLevel } from "./hobbyData";
import { interestLevelOptions } from "./hobbyData";

// ── 评分计算 ──

export type DimensionScore = {
  category: HobbyCategory;
  breadthScore: number; // 0-10
  depthScore: number; // 0-10
  total: number; // weighted: breadth*0.6 + depth*0.4
  hobbyCount: number;
};

export type RadarResult = {
  dimensions: DimensionScore[];
  overallScore: number; // average of 3 dimensions
  profileName: string;
  profileDescription: string;
};

// 广度分：基于该类型爱好数量
function calcBreadthScore(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 3;
  if (count <= 4) return 6;
  return 10;
}

// 深度分：基于用户对该类型主要爱好的兴趣层级
function calcDepthScore(levels: InterestLevel[]): number {
  if (levels.length === 0) return 0;
  const scores = levels.map(
    (l) => interestLevelOptions.find((o) => o.value === l)?.score ?? 2
  );
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function calculateRadar(
  selectedHobbies: Record<HobbyCategory, string[]>,
  interestLevels: Record<string, InterestLevel>
): RadarResult {
  const categories: HobbyCategory[] = ["physical", "creative", "cognitive"];

  const dimensions: DimensionScore[] = categories.map((cat) => {
    const hobbyIds = selectedHobbies[cat] ?? [];
    const breadth = calcBreadthScore(hobbyIds.length);
    const depthLevels = hobbyIds
      .map((id) => interestLevels[id])
      .filter(Boolean) as InterestLevel[];
    const depth = calcDepthScore(depthLevels);
    const total = +(breadth * 0.6 + depth * 0.4).toFixed(1);

    return {
      category: cat,
      breadthScore: breadth,
      depthScore: depth,
      total,
      hobbyCount: hobbyIds.length,
    };
  });

  const overallScore = +(
    dimensions.reduce((s, d) => s + d.total, 0) / 3
  ).toFixed(1);

  const { profileName, profileDescription } = getProfile(dimensions);

  return { dimensions, overallScore, profileName, profileDescription };
}

// ── 健康画像判定 ──

function getProfile(dimensions: DimensionScore[]): {
  profileName: string;
  profileDescription: string;
} {
  const sorted = [...dimensions].sort((a, b) => b.total - a.total);
  const top = sorted[0].category;
  const bottom = sorted[2].category;

  const profiles: Record<string, { name: string; desc: string }> = {
    physical: {
      name: "运动活力型",
      desc: "你拥有良好的运动习惯，身体是你的坚实后盾。适当增加创作和智力活动，可以让生活更加丰富立体。",
    },
    creative: {
      name: "创作表达型",
      desc: "你善于用创作表达自我，内心世界丰富。保持体能锻炼和智力挑战，能让你的创造力持续续航。",
    },
    cognitive: {
      name: "学习探索型",
      desc: "你对知识和思考充满热情，认知储备充足。别忘了让身体动起来，让创作成为思考的出口。",
    },
  };

  // 找短板
  const weaknessMap: Record<string, string> = {
    physical: "体能活动偏少，可能影响身体基座",
    creative: "创作输出不足，心理成就感来源有限",
    cognitive: "智力挑战偏少，认知储备有待加强",
  };

  const topProfile = profiles[top];
  const weakness = weaknessMap[bottom];

  return {
    profileName: topProfile.name,
    profileDescription: `${topProfile.desc}${weakness ? `当前的主要短板是：${weakness}。` : ""}`,
  };
}

// ── 找出最薄弱维度 ──

export function getWeakestDimension(
  dimensions: DimensionScore[]
): DimensionScore {
  return [...dimensions].sort((a, b) => a.total - b.total)[0];
}
