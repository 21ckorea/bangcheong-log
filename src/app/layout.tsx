import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "방청로그 (Bangcheong-Log)",
  description: "나의 첫 번째 방청 기록, 방청로그",
  manifest: "/manifest.json",
  openGraph: {
    title: "방청로그 (Bangcheong-Log)",
    description: "모든 방송사 방청 정보가 한곳에! 흩어진 방청 신청, 알림 받고 한 번에 성공해봐!",
    url: "https://bangcheong-log.archion.space",
    siteName: "방청로그",
    images: [
      {
        url: "/og-image.png", // We'll create this image
        width: 1200,
        height: 630,
        alt: "방청로그 - 방송 방청 신청 통합 플랫폼",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "방청로그 (Bangcheong-Log)",
    description: "모든 방송사 방청 정보가 한곳에!",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen selection:bg-purple-500/30`}
      >
        {children}
      </body>
    </html>
  );
}
