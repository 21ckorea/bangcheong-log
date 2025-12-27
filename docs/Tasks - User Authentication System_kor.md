# 사용자 인증 시스템 구현 계획

## 개요
구글 OAuth 로그인, 사용자 프로필, 관심 프로그램 기능을 포함한 완전한 사용자 인증 시스템을 구현합니다.

## 사전 준비사항

### 구글 OAuth 설정 필요
구글 클라우드 프로젝트를 생성하고 OAuth 인증 정보를 받아야 합니다:

1. [Google Cloud Console](https://console.cloud.google.com/)로 이동
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Google+ API 활성화
4. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
5. 승인된 리디렉션 URI 추가:
   - 프로덕션: `https://bangcheong-log.archion.space/api/auth/callback/google`
   - 개발: `http://localhost:3000/api/auth/callback/google`

다음 정보를 받게 됩니다:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

이 정보들을 환경 변수에 추가해야 합니다.

### 데이터베이스 스키마 변경
다음 테이블들을 데이터베이스에 추가해야 합니다:
- `User` 테이블: 사용자 계정
- `Account` 테이블: OAuth 제공자 정보
- `Session` 테이블: 사용자 세션
- `FavoriteProgram` 테이블: 사용자 관심 프로그램

데이터베이스 마이그레이션이 필요합니다.

---

## 구현 단계

### 1. 데이터베이스 설정

#### Prisma 스키마 업데이트
`prisma/schema.prisma`에 다음 모델들을 추가:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  favorites     FavoriteProgram[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model FavoriteProgram {
  id        String   @id @default(cuid())
  userId    String
  programId String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  program   Program  @relation(fields: [programId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, programId])
}
```

`Program` 모델 업데이트:
```prisma
model Program {
  // ... 기존 필드들
  favorites FavoriteProgram[]
}
```

#### 마이그레이션 실행
```bash
npx prisma migrate dev --name add_user_auth
npx prisma generate
```

---

### 2. 의존성 설치

```bash
npm install next-auth@beta @auth/prisma-adapter
```

---

### 3. 인증 설정

#### `src/lib/auth.config.ts` 생성
```typescript
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
```

#### `src/app/api/auth/[...nextauth]/route.ts` 생성
```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth.config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

#### `.env.local` 업데이트
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

### 4. 서버 액션

`src/app/actions/user.ts` 생성:

```typescript
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/db";

export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "인증되지 않음" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      favorites: {
        include: {
          program: true,
        },
      },
    },
  });

  return { success: true, data: user };
}

export async function toggleFavoriteProgram(programId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "인증되지 않음" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { success: false, error: "사용자를 찾을 수 없음" };
  }

  const existing = await prisma.favoriteProgram.findUnique({
    where: {
      userId_programId: {
        userId: user.id,
        programId: programId,
      },
    },
  });

  if (existing) {
    await prisma.favoriteProgram.delete({
      where: { id: existing.id },
    });
    return { success: true, action: "removed" };
  } else {
    await prisma.favoriteProgram.create({
      data: {
        userId: user.id,
        programId: programId,
      },
    });
    return { success: true, action: "added" };
  }
}
```

---

### 5. UI 컴포넌트

#### 로그인 버튼 컴포넌트
`src/components/auth/LoginButton.tsx` 생성

#### 사용자 메뉴 컴포넌트
`src/components/auth/UserMenu.tsx` 생성

#### 헤더 업데이트
`src/components/layout/Header.tsx`에 인증 UI 추가

#### 관심 프로그램 버튼 추가
`src/components/home/HomeClient.tsx`의 프로그램 카드에 관심 프로그램 버튼 추가

#### 프로필 페이지
`src/app/profile/page.tsx` 생성

---

## 테스트 체크리스트

- [ ] 구글 OAuth 로그인 플로우 작동
- [ ] 페이지 새로고침 후에도 사용자 세션 유지
- [ ] 관심 프로그램 추가/제거 가능
- [ ] 프로필 페이지에 사용자 정보 표시
- [ ] 로그아웃 기능 작동
- [ ] 비인증 접근 적절히 처리

---

## 배포 참고사항

1. Vercel에 환경 변수 추가:
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

2. 구글 OAuth 승인된 리디렉션 URI에 프로덕션 URL 추가

3. 프로덕션 데이터베이스에서 마이그레이션 실행
