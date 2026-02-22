import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "《一生的整理》｜Wisdompace",
  description: "Wisdompace | A lifelong practice of living",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}
