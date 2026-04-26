"use client";

import { useMemo } from "react";

const CHARS = ["✦", "✧", "✦", "·", "✧", "✦", "⋆", "·"];

export function ScatteredStars({ count = 90 }: { count?: number }) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      left: 1 + Math.random() * 97,
      top: 1 + Math.random() * 97,
      size: Math.random() * 8 + 5,
      a0: Math.random() * 0.08 + 0.03,
      a1: Math.random() * 0.18 + 0.08,
      dur: 2.5 + Math.random() * 3.5,
      delay: Math.random() * 5,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.key}
          className="bg-star"
          style={
            {
              left: `${s.left.toFixed(1)}%`,
              top: `${s.top.toFixed(1)}%`,
              fontSize: `${s.size.toFixed(1)}px`,
              animationDelay: `${s.delay.toFixed(1)}s`,
              ["--a0" as never]: s.a0.toFixed(2),
              ["--a1" as never]: s.a1.toFixed(2),
              ["--dur" as never]: `${s.dur.toFixed(1)}s`,
            } as React.CSSProperties
          }
        >
          {s.char}
        </span>
      ))}
    </div>
  );
}
