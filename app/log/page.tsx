"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScatteredStars } from "@/components/scattered-stars";
import { QUEST_TYPE_META } from "@/lib/quest-types";
import type { QuestTypeCount } from "@/lib/types";

export default function LogPage() {
  const router = useRouter();
  const [stats, setStats] = useState<QuestTypeCount[] | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("questlog_user_id");
    if (!uid) {
      router.replace("/");
      return;
    }

    void (async () => {
      try {
        const res = await fetch("/api/log/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "분석 실패");
        setStats(json.stats);
        setReport(json.report);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [router]);

  const chartData =
    stats?.map((s) => ({
      name:
        QUEST_TYPE_META[s.quest_type].emoji +
        " " +
        QUEST_TYPE_META[s.quest_type].label,
      value: s.count,
      quest_type: s.quest_type,
      fill: QUEST_TYPE_META[s.quest_type].barColor,
    })) ?? [];

  const total = stats?.reduce((acc, s) => acc + s.count, 0) ?? 0;

  return (
    <div className="relative animate-fade-in">
      <ScatteredStars count={90} />

      <div className="relative z-[1] space-y-5">
        <header className="pt-2">
          <h1 className="text-2xl font-black tracking-tight">
            나의 로그 <span className="text-xl">🛰️</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            지금까지 쌓아온 퀘스트들의 흔적
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>카테고리별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats ? (
              <Skeleton className="h-56 w-full" />
            ) : total === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                아직 완료한 퀘스트가 없어요
              </p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.15}
                      stroke="#ffffff"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#b8b2aa" }}
                      interval={0}
                      stroke="#403c3d"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#b8b2aa" }}
                      stroke="#403c3d"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#242122",
                        border: "1px solid #403c3d",
                        borderRadius: "8px",
                        color: "#f3f0ea",
                      }}
                      cursor={{ fill: "rgba(125,201,183,0.08)" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {total > 0 && (
              <p className="mt-3 text-sm text-muted-foreground text-center">
                총{" "}
                <span className="font-bold text-foreground">{total}</span>개의
                퀘스트를 완료했어요
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>✨ AI 코멘트</CardTitle>
          </CardHeader>
          <CardContent>
            {!report ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {report}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
