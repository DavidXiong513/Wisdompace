import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "我想咨询 | 思考熊Simon",
  description:
    "无论是组织变革、生涯规划，还是只想聊聊——联系思考熊Simon，开启你的终身整理之旅。",
};

export default function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
