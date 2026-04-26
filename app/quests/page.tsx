"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestCard } from "@/components/quest-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { QuestarTitle } from "@/components/questar-title";
import { AlienGreeting, DateChip } from "@/components/alien-greeting";
import { MyUniverse } from "@/components/my-universe";
import { RocketProgress } from "@/components/rocket-progress";
import { ScatteredStars } from "@/components/scattered-stars";
import type { Quest } from "@/lib/types";

export default function QuestsPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [totalCompleted, setTotalCompleted] = useState(0);
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

    setTotalCompleted(json.totalCompleted ?? 0);

    if (!json.quests || json.quests.length === 0) {
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

  const doneToday = quests?.filter((q) => q.completed).length ?? 0;
  const totalToday = quests?.length ?? 0;

  return (
    <div className="relative animate-fade-in">
      <ScatteredStars count={70} />

      <div className="relative z-[1] space-y-4">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <AlienGreeting />
            <DateChip />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-xs text-muted-foreground">
              안녕,{" "}
              <span className="font-semibold text-foreground">{nickname}</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              로그아웃
            </Button>
          </div>
          <div className="text-center pt-1">
            <QuestarTitle size="md" />
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <MyUniverse totalCompleted={totalCompleted} />
          <RocketProgress done={doneToday} total={totalToday} />
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">오늘의 퀘스트</h2>
              <p className="text-[10px] text-muted-foreground">
                인증하기를 눌러 사진을 남겨보세요
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          {generating && (
            <div className="text-center py-6 space-y-2">
              <div className="text-3xl animate-pulse">✨</div>
              <p className="text-xs text-muted-foreground">
                Claude가 오늘의 퀘스트를 짜고 있어요...
              </p>
            </div>
          )}

          {!quests && !generating && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          )}

          {quests && (
            <div className="space-y-3">
              {quests.map((q) => (
                <QuestCard key={q.id} quest={q} />
              ))}
            </div>
          )}

          {quests && quests.length > 0 && quests.every((q) => q.completed) && (
            <div className="rounded-2xl bg-gradient-to-br from-teal-950/70 to-teal-900/40 border-2 border-teal-700/40 p-4 text-center space-y-1">
              <div className="text-2xl">🌟</div>
              <p className="font-bold text-teal-100 text-sm">
                오늘의 퀘스트를 모두 완료했어요!
              </p>
              <p className="text-xs text-teal-300">
                내일 또 새로운 퀘스트가 도착할 거예요.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
