# Questlog!!! 🎯

AI가 매일 작은 퀘스트를 던져주는 챌린지 소셜 웹앱.

- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**
- **Supabase** (PostgreSQL + Storage)
- **Anthropic Claude API** — Opus 4.7로 퀘스트 생성/로그 분석
- **Recharts**로 통계 시각화

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) → New Project
2. 프로젝트 만든 뒤 **SQL Editor**에 들어가서 `supabase/schema.sql` 전체를 붙여넣고 실행
   - `users`, `quests`, `submissions` 테이블이 만들어집니다
   - `submissions` Storage 버킷도 함께 생성됩니다
3. **Project Settings → API**에서 다음 두 키를 복사:
   - `Project URL`
   - `anon public` 키
   - `service_role` 키 (⚠️ 절대 공개하지 마세요)

### 3. Anthropic API 키 받기

[console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key

### 4. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`을 열고 위에서 받은 키들로 채워주세요:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

## 기능

| 화면 | 경로 | 기능 |
|---|---|---|
| 시작 | `/` | 닉네임 입력 → 자동 가입/로그인 |
| 퀘스트 | `/quests` | 오늘의 퀘스트 3개 (없으면 AI 자동 생성) |
| 인증 업로드 | `/upload/[questId]` | 사진 + 캡션으로 퀘스트 인증 |
| 피드 | `/feed` | 모든 사용자의 최신 인증 사진 |
| 로그 | `/log` | 카테고리별 차트 + AI 분석 코멘트 |

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/users` | 닉네임으로 유저 생성/조회 |
| GET | `/api/quests?userId=...` | 오늘 자 퀘스트 목록 |
| POST | `/api/quests/generate` | AI로 오늘의 퀘스트 3개 생성 |
| POST | `/api/submissions` | 인증 업로드 (이미지 URL + 캡션) |
| GET | `/api/feed` | 전체 최신 피드 |
| POST | `/api/log/analyze` | 카테고리 통계 + AI 분석 코멘트 |

## 디렉토리 구조

```
questlog/
├── app/
│   ├── api/                   # Route Handlers
│   ├── page.tsx               # /
│   ├── quests/page.tsx        # /quests
│   ├── upload/[questId]/      # /upload/...
│   ├── feed/page.tsx          # /feed
│   └── log/page.tsx           # /log
├── components/
│   ├── ui/                    # shadcn-style primitives
│   ├── quest-card.tsx
│   ├── feed-card.tsx
│   └── nav.tsx
├── lib/
│   ├── anthropic.ts           # Claude Opus 4.7 래퍼
│   ├── supabase.ts            # 브라우저 클라이언트
│   ├── supabase-admin.ts      # 서버(service role) 클라이언트
│   ├── categories.ts          # 4개 카테고리 메타
│   ├── types.ts
│   └── utils.ts
└── supabase/
    └── schema.sql             # 한 번에 붙여넣어 실행
```

## 데모 모드 주의

`schema.sql`은 데모용으로 RLS와 Storage 정책을 모두 public access로 열어두었습니다.
실서비스로 가져갈 때는:

- 인증을 Supabase Auth로 교체
- RLS 정책을 user_id 기반으로 좁히기
- service-role 키는 서버에서만 쓰기 (현재 그렇게 사용 중)

## 라이선스

해커톤/학습 용도로 자유롭게 사용하세요.
