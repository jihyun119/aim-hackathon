import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Starfield } from "@/components/starfield";

export const metadata: Metadata = {
  title: "Questar",
  description: "AI가 매일 던지는 작은 퀘스트로 일상을 기록하는 챌린지 소셜",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1818",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-svh">
        <Starfield />
        <main className="container max-w-md pb-24 pt-4 relative z-10">
          {children}
        </main>
        <Nav />
      </body>
    </html>
  );
}
