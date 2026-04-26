"use client";

import { useEffect, useState } from "react";
import { Heart, Share2 } from "lucide-react";
import { QUEST_TYPE_META } from "@/lib/quest-types";
import { cn, timeAgo } from "@/lib/utils";
import type { FeedItem } from "@/lib/types";

const LIKES_KEY = "questlog_likes";

function readLikes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLikes(ids: string[]) {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(ids));
  } catch {}
}

export function FeedCard({ item }: { item: FeedItem }) {
  const meta = QUEST_TYPE_META[item.quest.quest_type];
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(readLikes().includes(item.submission.id));
  }, [item.submission.id]);

  function toggleLike() {
    setLiked((prev) => {
      const next = !prev;
      const cur = readLikes();
      writeLikes(
        next
          ? Array.from(new Set([...cur, item.submission.id]))
          : cur.filter((id) => id !== item.submission.id)
      );
      return next;
    });
  }

  async function share() {
    const url = item.submission.image_url;
    const text = `${item.user.nickname}: ${item.quest.title}`;
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    };
    if (nav.share) {
      try {
        await nav.share({ title: "Questlog", text, url });
        return;
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("이미지 링크를 복사했어요");
    } catch {
      alert(url);
    }
  }

  return (
    <article
      className="relative w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-md animate-fade-in"
      style={{ aspectRatio: "4 / 5" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.submission.image_url}
        alt={item.quest.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlays — softer so photo stays visible */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/65 to-transparent" />

      {/* Top-left: profile + nickname */}
      <div className="absolute left-4 top-4 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-white to-zinc-200 font-bold text-zinc-800 ring-2 ring-white/40 shadow">
          {item.user.nickname.slice(0, 1).toUpperCase()}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            {item.user.nickname}
          </p>
          <p className="text-xs text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
            {timeAgo(item.submission.created_at)}
          </p>
        </div>
      </div>

      {/* Top-right: quest type chip */}
      <div className="absolute right-4 top-5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
        {meta.emoji} {meta.label}
      </div>

      {/* Right rail: action icons */}
      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-3">
        <button
          onClick={share}
          aria-label="공유"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition active:scale-90"
        >
          <Share2 className="h-5 w-5" />
        </button>
        <button
          onClick={toggleLike}
          aria-label={liked ? "좋아요 취소" : "좋아요"}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition active:scale-90",
            liked ? "bg-rose-500 text-white" : "bg-white/20 text-white"
          )}
        >
          <Heart className={cn("h-5 w-5", liked && "fill-current")} />
        </button>
      </div>

      {/* Center-lower: quest title + caption */}
      <div className="absolute inset-x-6 bottom-8 space-y-2 text-center">
        <h3 className="text-balance text-2xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
          {item.quest.title}
        </h3>
        {item.submission.caption && (
          <p className="line-clamp-2 text-sm leading-snug text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]">
            {item.submission.caption}
          </p>
        )}
      </div>
    </article>
  );
}
