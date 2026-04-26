"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QUEST_TYPE_META } from "@/lib/quest-types";
import type { Quest } from "@/lib/types";

export function QuestCard({ quest }: { quest: Quest }) {
  const meta = QUEST_TYPE_META[quest.quest_type];
  return (
    <Card
      className={cn(
        "overflow-hidden border-2 bg-gradient-to-br animate-fade-in",
        meta.theme,
        quest.completed && "opacity-70"
      )}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Badge className={meta.chip}>
            {meta.emoji} {meta.label}
          </Badge>
          {quest.completed && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Check className="h-3.5 w-3.5" /> 완료
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold leading-snug">{quest.title}</h3>
        {quest.description && (
          <p className="text-sm leading-relaxed opacity-80">
            {quest.description}
          </p>
        )}
        <div className="pt-2">
          {quest.completed ? (
            <Button variant="ghost" size="sm" disabled className="w-full">
              인증 완료
            </Button>
          ) : (
            <Link href={`/upload/${quest.id}`}>
              <Button size="sm" className="w-full">
                인증하기 →
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
