import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import "@/styles/about-simon-tokens.css";

export const metadata: Metadata = {
  title: {
    default: "思考熊Simon | 做组织与个体的终身整理者",
    template: "%s | 思考熊Simon",
  },
  description:
    "20年HR实战 + 国学修行智慧，为组织与个体提供终身整理服务。组织变革、生涯规划、MBTI测评，一位借假修真的思考熊Simon。",
};

export default function AboutSimonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
