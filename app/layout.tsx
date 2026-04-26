import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Questlog!!!",
  description: "AI가 매일 던지는 작은 퀘스트로 일상을 기록하는 챌린지 소셜",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafaf7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-svh">
        <main className="container max-w-md pb-24 pt-4">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
