/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 루트 레이아웃
 * SEO/AEO/GEO 최적화 메타데이터 + Pretendard 폰트
 */

import type { Metadata } from "next";
import "./globals.css";

// SEO/AEO/GEO 최적화 메타데이터
export const metadata: Metadata = {
  title: {
    default: "ARI - AI가 만드는 가장 한국적인 선율",
    template: "%s | ARI",
  },
  description:
    "AI 아티스트를 위한 음원 플랫폼 ARI. AI 생성 음원의 권리를 보호하고, K-가락의 새로운 시대를 엽니다. 투명한 차트, 포렌식 워터마킹, Notice & Takedown 시스템으로 안전한 창작 환경을 제공합니다.",
  keywords: [
    "AI 음악",
    "AI 음원",
    "AI 아티스트",
    "K-가락",
    "한국 음악",
    "AI 작곡",
    "음원 플랫폼",
    "ARI",
    "아리",
  ],
  authors: [{ name: "BZ'NEXA" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "ARI - Artificial Rhythm Intelligence",
    title: "ARI - AI가 만드는 가장 한국적인 선율",
    description:
      "AI 아티스트를 위한 음원 플랫폼. 투명한 차트와 법적 보호로 안전한 창작 환경.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARI - AI Music Platform",
    description: "The New K-Garak: AI가 만드는 가장 한국적인 선율",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
