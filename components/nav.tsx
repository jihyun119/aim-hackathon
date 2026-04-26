"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/quests", label: "퀘스트", icon: Home },
  { href: "/feed", label: "피드", icon: Newspaper },
  { href: "/log", label: "로그", icon: BarChart3 },
];

export function Nav() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/upload")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container max-w-md flex items-center justify-around py-2">
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
