import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务产品 | 思考熊Simon",
  description:
    "B端组织项目与C端个体咨询双轮驱动。组织变革、人才盘点、MBTI专业测评、生涯规划咨询——即知企业痛点，也懂打工人心声。",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
