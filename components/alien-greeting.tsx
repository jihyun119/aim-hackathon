"use client";

export function AlienGreeting({
  message = "오늘의 퀘스트는...",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://em-content.zobj.net/source/apple/453/alien_1f47d.png"
        alt=""
        aria-hidden="true"
        className="w-12 h-12 object-contain"
      />
      <span className="speech-bubble">{message}</span>
    </div>
  );
}

export function DateChip() {
  const now = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const text = `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;
  return (
    <div className="rounded-xl border border-white/10 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
      {text}
    </div>
  );
}
