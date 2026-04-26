"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_META } from "@/lib/categories";
import type { Quest } from "@/lib/types";

function StarIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function QuestCard({ quest }: { quest: Quest }) {
  const meta = CATEGORY_META[quest.category];
  return (
    <Card
      className={cn(
        "overflow-hidden border-2 bg-gradient-to-br animate-fade-in",
        meta.tone,
        quest.completed && "opacity-70"
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            disabled
            className={cn("check-btn", quest.completed && "checked")}
            aria-label={quest.completed ? "완료됨" : "미완료"}
          >
            <StarIcon />
          </button>
          <div className="flex-1 min-w-0 space-y-1.5">
            <Badge className={meta.chip}>
              {meta.emoji} {meta.label}
            </Badge>
            <h3 className="text-base font-bold leading-snug">{quest.title}</h3>
            {quest.description && (
              <p className="text-xs leading-relaxed opacity-75">
                {quest.description}
              </p>
            )}
          </div>
        </div>

        <div>
          {quest.completed ? (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="w-full opacity-60"
            >
              인증 완료
            </Button>
          ) : (
            <Link href={`/upload/${quest.id}`}>
              <Button
                size="sm"
                className="w-full bg-white/10 hover:bg-white/20 border border-white/15 text-foreground"
              >
                인증하기 →
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
