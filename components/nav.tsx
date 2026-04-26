"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/quests", label: "퀘스트", emoji: "🚀" },
  { href: "/feed", label: "피드", emoji: "👾" },
  { href: "/log", label: "로그", emoji: "🛰️" },
];

export function Nav() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/upload")) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-white/10 bg-[#242122]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#242122]/70"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 max-w-[90px] flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className="text-[10px] font-bold tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
