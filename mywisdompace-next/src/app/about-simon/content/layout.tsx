import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "内容作品 | 思考熊Simon",
  description:
    "微信公众号、视频号、小红书多平台内容创作。组织观察、生涯导航、修行笔记、素食生活、AI+人文——五种内容风格，同一个思考者。",
};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
