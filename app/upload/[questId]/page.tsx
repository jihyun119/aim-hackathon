"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QUEST_TYPE_META } from "@/lib/quest-types";
import { supabase, SUBMISSIONS_BUCKET } from "@/lib/supabase";
import type { Quest } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const params = useParams<{ questId: string }>();
  const questId = params.questId;

  const [userId, setUserId] = useState<string | null>(null);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("questlog_user_id");
    if (!uid) {
      router.replace("/");
      return;
    }
    setUserId(uid);

    void (async () => {
      const res = await fetch(`/api/quests?userId=${uid}`);
      const json = await res.json();
      const q = (json.quests ?? []).find((x: Quest) => x.id === questId);
      if (!q) {
        setError("퀘스트를 찾을 수 없어요.");
        return;
      }
      setQuest(q);
    })();
  }, [questId, router]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !userId || !quest) return;

    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${quest.id}-${Date.now()}.${ext}`;

      const upload = await supabase.storage
        .from(SUBMISSIONS_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upload.error) throw upload.error;

      const { data: pub } = supabase.storage
        .from(SUBMISSIONS_BUCKET)
        .getPublicUrl(path);

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: quest.id,
          userId,
          imageUrl: pub.publicUrl,
          caption: caption.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "업로드 실패");

      router.push("/feed");
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setUploading(false);
    }
  }

  if (!quest) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {error ?? "불러오는 중..."}
      </div>
    );
  }

  const meta = QUEST_TYPE_META[quest.quest_type];

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 뒤로
      </button>

      <Card className={`bg-gradient-to-br ${meta.theme} border-2`}>
        <CardContent className="p-5 space-y-2">
          <Badge className={meta.chip}>
            {meta.emoji} {meta.label}
          </Badge>
          <h2 className="text-lg font-bold">{quest.title}</h2>
          {quest.description && (
            <p className="text-sm opacity-80">{quest.description}</p>
          )}
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="space-y-4">
        <label
          htmlFor="image"
          className="block aspect-square w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/40 cursor-pointer overflow-hidden"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="미리보기"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImagePlus className="h-10 w-10" />
              <span className="text-sm">탭해서 사진 선택</span>
            </div>
          )}
          <input
            id="image"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPick}
            disabled={uploading}
          />
        </label>

        <Textarea
          placeholder="한 줄 메모 (선택)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={200}
          disabled={uploading}
        />

        {error && (
          <p className="text-sm text-destructive bg-destructive/5 rounded-lg border border-destructive/30 p-3">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={uploading || !file}
        >
          {uploading ? "업로드 중..." : "인증 완료하기"}
        </Button>
      </form>
    </div>
  );
}
