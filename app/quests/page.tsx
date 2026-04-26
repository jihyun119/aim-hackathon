"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestCard } from "@/components/quest-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Quest } from "@/lib/types";

export default function QuestsPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("questlog_user_id");
    const nick = localStorage.getItem("questlog_nickname") ?? "";
    if (!userId) {
      router.replace("/");
      return;
    }
    setNickname(nick);
    void load(userId);
  }, [router]);

  async function load(userId: string) {
    setError(null);
    const res = await fetch(`/api/quests?userId=${userId}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "불러오기 실패");
      return;
    }

    if (!json.quests || json.quests.length === 0) {
      // No quests yet today — generate them.
      await generate(userId);
    } else {
      setQuests(json.quests);
    }
  }

  async function generate(userId: string) {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/quests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "생성 실패");
      setQuests(json.quests);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  function logout() {
    localStorage.removeItem("questlog_user_id");
    localStorage.removeItem("questlog_nickname");
    router.replace("/");
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="flex items-end justify-between pt-2">
        <div>
          <p className="text-sm text-muted-foreground">
            안녕, <span className="font-semibold text-foreground">{nickname}</span>
          </p>
          <h1 className="text-2xl font-black tracking-tight">오늘의 퀘스트</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          로그아웃
        </Button>
      </header>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {generating && (
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl animate-pulse">✨</div>
          <p className="text-sm text-muted-foreground">
            Claude가 오늘의 퀘스트를 짜고 있어요...
          </p>
        </div>
      )}

      {!quests && !generating && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      )}

      {quests && (
        <div className="space-y-4">
          {quests.map((q) => (
            <QuestCard key={q.id} quest={q} />
          ))}
        </div>
      )}

      {quests && quests.every((q) => q.completed) && (
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 p-5 text-center space-y-2">
          <div className="text-3xl">🎉</div>
          <p className="font-bold text-emerald-900">
            오늘의 퀘스트를 모두 완료했어요!
          </p>
          <p className="text-sm text-emerald-700">
            내일 또 새로운 퀘스트가 도착할 거예요.
          </p>
        </div>
      )}
    </div>
  );
}
