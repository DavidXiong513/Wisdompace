import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC, Roboto } from "next/font/google";

import "./globals.css";

import NavBar from "@/components/NavBar";

const roboto = Roboto({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

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
      <body
        className={`${roboto.variable} ${notoSansSC.variable} ${notoSerifSC.variable} antialiased`}
      >
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
