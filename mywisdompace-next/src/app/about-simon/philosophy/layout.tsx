import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "理念体系 | 思考熊Simon",
  description:
    "借假修真 向死而生。物质低配、能力高配、精神顶配——20年HR实战与国学修行智慧的结晶。",
};

export default function PhilosophyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
