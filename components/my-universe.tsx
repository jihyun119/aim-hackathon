"use client";

export function MyUniverse({ totalCompleted }: { totalCompleted: number }) {
  const starCount = Math.floor(totalCompleted / 10);
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <h3 className="text-xs font-bold mb-1 text-foreground">나의 우주</h3>
      <p className="text-[10px] text-muted-foreground mb-2">
        퀘스트 10개마다 별이 생겨요
      </p>
      <div className="flex flex-wrap gap-[3px] min-h-[22px] mb-1">
        {starCount === 0 ? (
          <span className="text-[10px] italic text-[hsl(var(--muted-foreground))/.7] leading-snug">
            아직 별이 없어요.
            <br />
            퀘스트를 완료해보세요 ✨
          </span>
        ) : (
          Array.from({ length: starCount }).map((_, i) => (
            <span
              key={i}
              className="universe-star"
              style={{ animationDelay: `${(i * 0.04).toFixed(2)}s` }}
            >
              ★
            </span>
          ))
        )}
      </div>
      <div className="text-[10px] text-[hsl(var(--muted-foreground))/.7]">
        총 {totalCompleted}개 완료 · 별 {starCount}개
      </div>
    </section>
  );
}
