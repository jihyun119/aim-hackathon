"use client";

export function RocketProgress({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <h3 className="text-xs font-bold mb-1 text-foreground">오늘 진행률</h3>
      <p className="text-[10px] text-muted-foreground">
        {total}개 중 {done}개 완료했어요.
      </p>
      <div className="rocket-progress mt-2">
        <span className="rp-earth">🌏</span>
        <div className="rp-track">
          <div className="rp-fill" style={{ width: `${pct}%` }} />
          <span className="rp-rocket-wrap" style={{ left: `${pct}%` }}>
            <span className="rp-flame" />
            <span className="rp-icon">🚀</span>
          </span>
        </div>
        <span className="rp-moon">🌑</span>
      </div>
    </section>
  );
}
