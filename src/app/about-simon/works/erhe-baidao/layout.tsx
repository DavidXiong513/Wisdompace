import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "二河白道 · 跑酷 | 思考熊Simon",
  description:
    "水火二河之间只有一条白道，宽不过四五寸。以佛教典故为背景的 3D 跑酷小游戏，三幕关卡，电脑与手机都能玩。",
};

export default function ErheBaidaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
