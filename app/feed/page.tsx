"use client";

import { useEffect, useState } from "react";
import { FeedCard } from "@/components/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScatteredStars } from "@/components/scattered-stars";
import type { FeedItem } from "@/lib/types";

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/feed");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "불러오기 실패");
        setFeed(json.feed);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <div className="relative animate-fade-in">
      <ScatteredStars count={90} />

      <div className="relative z-[1] space-y-5">
        <header className="pt-2">
          <h1 className="text-2xl font-black tracking-tight">
            피드 <span className="text-xl">👾</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            오늘 다른 사람들은 어떤 퀘스트를 해냈을까요?
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!feed && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                className="w-full rounded-3xl"
                style={{ aspectRatio: "4 / 5" }}
              />
            ))}
          </div>
        )}

        {feed && feed.length === 0 && (
          <div className="space-y-2 py-20 text-center text-muted-foreground">
            <div className="text-4xl">📭</div>
            <p>아직 인증된 게시물이 없어요</p>
            <p className="text-xs">첫 번째 인증의 주인공이 되어보세요!</p>
          </div>
        )}

        {feed && feed.length > 0 && (
          <div className="space-y-3">
            {feed.map((item) => (
              <FeedCard key={item.submission.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
