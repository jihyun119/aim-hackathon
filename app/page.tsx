"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScatteredStars } from "@/components/scattered-stars";
import { QuestarTitle } from "@/components/questar-title";
import { cn } from "@/lib/utils";
import {
  DAILY_STATES,
  DAILY_STATE_LABEL,
  INTEREST_OPTIONS,
  LIFE_STAGES,
  QUEST_PREF_OPTIONS,
  type DailyState,
} from "@/lib/quest-types";

type Step = 0 | 1 | 2 | 3 | 4;

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);
  const [nickname, setNickname] = useState("");
  const [lifeStage, setLifeStage] = useState<string | null>(null);
  const [dailyState, setDailyState] = useState<DailyState | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [questPref, setQuestPref] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId =
      typeof window !== "undefined"
        ? localStorage.getItem("questlog_user_id")
        : null;
    if (userId) router.replace("/quests");
  }, [router]);

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return nickname.trim().length > 0 && nickname.trim().length <= 24;
      case 1:
        return !!lifeStage;
      case 2:
        return !!dailyState;
      case 3:
        return interests.length > 0 && interests.length <= 3;
      case 4:
        return !!questPref;
    }
  }, [step, nickname, lifeStage, dailyState, interests, questPref]);

  function toggleInterest(value: string) {
    setInterests((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= 3) return prev;
      return [...prev, value];
    });
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          lifeStage,
          dailyState,
          interests,
          questPref,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "오류가 발생했어요");

      localStorage.setItem("questlog_user_id", json.user.id);
      localStorage.setItem("questlog_nickname", json.user.nickname);
      router.push("/quests");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (!canNext) return;
    if (step === 4) {
      void handleSubmit();
      return;
    }
    setStep((s) => ((s + 1) as Step));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1) as Step);
  }

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center animate-fade-in">
      <ScatteredStars count={70} />

      <div className="relative z-[1]">
        {step === 0 && (
          <div className="text-center mb-8 space-y-4">
            <QuestarTitle size="lg" />
            <p className="text-muted-foreground leading-relaxed text-sm">
              AI가 매일 작은 퀘스트를 던져요.
              <br />
              먼저 당신을 짧게 알려주세요.
            </p>
          </div>
        )}

        <ProgressDots current={step} total={TOTAL_STEPS} />

        <Card>
        <CardContent className="p-6 space-y-5">
          {step === 0 && (
            <StepNickname
              value={nickname}
              onChange={setNickname}
              onEnter={next}
              disabled={submitting}
            />
          )}
          {step === 1 && (
            <StepSingleChoice
              title="지금 가장 가까운 일상은?"
              options={LIFE_STAGES.map((v) => ({ value: v, label: v }))}
              value={lifeStage}
              onChange={setLifeStage}
            />
          )}
          {step === 2 && (
            <StepSingleChoice
              title="요즘 일상은 어떤 편이에요?"
              options={DAILY_STATES.map((v) => ({
                value: v,
                label: DAILY_STATE_LABEL[v],
              }))}
              value={dailyState}
              onChange={(v) => setDailyState(v as DailyState)}
            />
          )}
          {step === 3 && (
            <StepMultiChoice
              title="이런 퀘스트라면 더 재밌다"
              hint="최대 3개까지 선택"
              options={INTEREST_OPTIONS.map((v) => ({ value: v, label: v }))}
              values={interests}
              onToggle={toggleInterest}
              max={3}
            />
          )}
          {step === 4 && (
            <StepSingleChoice
              title="어떤 일이 더 끌리세요?"
              options={QUEST_PREF_OPTIONS.map((v) => ({ value: v, label: v }))}
              value={questPref}
              onChange={setQuestPref}
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-2 pt-2">
            {step > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={back}
                disabled={submitting}
              >
                ← 이전
              </Button>
            )}
            <Button
              type="button"
              size="lg"
              className="flex-1"
              disabled={!canNext || submitting}
              onClick={next}
            >
              {step === 4
                ? submitting
                  ? "준비 중..."
                  : "시작하기 →"
                : "다음 →"}
            </Button>
          </div>
        </CardContent>
      </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          하나의 닉네임이 곧 당신의 계정이 돼요
        </p>
      </div>
    </div>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-4">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current ? "w-6 bg-foreground" : "w-1.5 bg-muted"
          )}
        />
      ))}
    </div>
  );
}

function StepNickname(props: {
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">닉네임</label>
      <Input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && props.value.trim()) {
            e.preventDefault();
            props.onEnter();
          }
        }}
        placeholder="예: 햇살같은개구리"
        maxLength={24}
        disabled={props.disabled}
        autoFocus
      />
    </div>
  );
}

function StepSingleChoice<T extends string>(props: {
  title: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">{props.title}</h2>
      <div className="grid gap-2">
        {props.options.map((opt) => {
          const active = props.value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => props.onChange(opt.value)}
              className={cn(
                "w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition",
                "hover:border-foreground/40",
                active
                  ? "border-foreground bg-foreground text-background font-semibold"
                  : "border-border bg-background"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepMultiChoice(props: {
  title: string;
  hint?: string;
  options: { value: string; label: string }[];
  values: string[];
  onToggle: (v: string) => void;
  max: number;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold">{props.title}</h2>
        {props.hint && (
          <p className="text-xs text-muted-foreground mt-1">
            {props.hint} ({props.values.length}/{props.max})
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {props.options.map((opt) => {
          const active = props.values.includes(opt.value);
          const disabled = !active && props.values.length >= props.max;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => props.onToggle(opt.value)}
              disabled={disabled}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-sm transition",
                "disabled:opacity-40",
                active
                  ? "border-foreground bg-foreground text-background font-semibold"
                  : "border-border bg-background hover:border-foreground/40"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
