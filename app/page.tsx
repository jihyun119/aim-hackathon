"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { QuestarTitle } from "@/components/questar-title";
import { ScatteredStars } from "@/components/scattered-stars";

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId =
      typeof window !== "undefined"
        ? localStorage.getItem("questlog_user_id")
        : null;
    if (userId) router.replace("/quests");
  }, [router]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nickname.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "오류가 발생했어요");

      localStorage.setItem("questlog_user_id", json.user.id);
      localStorage.setItem("questlog_nickname", json.user.nickname);
      router.push("/quests");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center animate-fade-in">
      <ScatteredStars count={70} />

      <div className="relative z-[1]">
        <div className="text-center mb-10 space-y-4">
          <QuestarTitle size="lg" />
          <p className="text-muted-foreground leading-relaxed text-sm">
            AI가 매일 작은 퀘스트를 던져요.
            <br />
            오늘 하루를 가볍게 흔들어볼까요?
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleStart} className="space-y-4">
              <label className="text-sm font-medium">닉네임</label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 햇살같은개구리"
                maxLength={24}
                disabled={loading}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || !nickname.trim()}
              >
                {loading ? "준비 중..." : "시작하기 →"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          하나의 닉네임이 곧 당신의 계정이 돼요
        </p>
      </div>
    </div>
  );
}
