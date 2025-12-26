# 구현 계획서 (Implementation Plan) - 방청로그 (Bangcheong-Log)

## 목표 (Goal Description)
**방청로그(Bangcheong-Log)**의 MVP(최소 기능 제품)를 구축합니다. 이 웹 애플리케이션은 방청 신청 정보를 통합 제공하고 사용자가 자신의 방청 경험을 기록할 수 있게 합니다. Vlog 세대를 겨냥한 프리미엄하고 시각적으로 매력적인 모바일 우선(Mobile-First) 디자인에 중점을 둡니다.

## 사용자 검토 필요 (User Review Required)
> [!IMPORTANT]
> **기술 스택 선정**: 프론트엔드 및 백엔드 API로 **Next.js 14 (App Router)**를 사용하고, 스타일링을 위해 **Tailwind CSS**, 로컬 개발 편의성을 위해 **SQLite** (Prisma 사용)를 제안합니다.
>
> **디자인 라이브러리**: "프리미엄"하고 "동적인" 느낌을 구현하기 위해 **Framer Motion**(애니메이션)과 **Lucide React**(아이콘)를 사용할 예정입니다.

## 변경 제안 (Proposed Changes)

### 프로젝트 초기화 (Project Initialization)
#### [NEW] [bangcheong-log](file:///d:/work/web/Bangcheong_Log)
- Next.js 프로젝트 초기화: `npx create-next-app@latest .`
  - TypeScript: Yes
  - Tailwind CSS: Yes
  - ESLint: Yes
  - App Router: Yes
  - Import Alias: `@/*`
- 추가 의존성 설치:
  - `next-intl`: 국제화 지원 (영어/한국어).
  - `framer-motion`: 애니메이션 효과.
  - `lucide-react`: 아이콘.
  - `clsx`, `tailwind-merge`: 유틸리티 클래스 관리.
  - `prisma`: 데이터베이스 ORM.
  - `cheerio`: 크롤러 구현 (간단한 버전).

### 컴포넌트 구조 (Component Structure)
#### [NEW] [components](file:///d:/work/web/Bangcheong_Log/components)
- **UI 시스템**: 재사용 가능한 심미적 컴포넌트 (카드, 버튼, 입력 필드 등).
- **레이아웃**: 내비게이션 바가 포함된 모바일 우선 레이아웃 래퍼.
- **I18n**: 언어 전환기(Locale Switcher) 및 다국어 텍스트 처리.

### 기능 구현 (Feature Implementation)
#### [NEW] [app](file:///d:/work/web/Bangcheong_Log/app)
- `[locale]/page.tsx`: 메인 랜딩 페이지 (다국어 지원).
- `[locale]/apply/page.tsx`: 응모 가이드.
- `[locale]/log/page.tsx`: 사용자 로그(후기) 페이지.
- `i18n.ts`: i18n 설정.
- `middleware.ts`: 언어 감지 및 라우팅 미들웨어.

### 데이터베이스 스키마 (Database Schema)
#### [NEW] [prisma/schema.prisma](file:///d:/work/web/Bangcheong_Log/prisma/schema.prisma)
- `Program`: 방청 정보 저장 (프로그램명, 방송사, 날짜, 링크).
- `User`: 사용자 정보 (MVP에서는 로컬 스토리지 또는 간단한 인증 고려).
- `Log`: 사용자 후기 데이터.

## 검증 계획 (Verification Plan)

### 자동화 테스트 (Automated Tests)
- 빌드 검증: `npm run build` 정상 완료 확인.
- 린트 체크: `npm run lint` 오류 없음 확인.

### 수동 검증 (Manual Verification)
- **비주얼 체크**:
    - "프리미엄" 심미성(폰트, 컬러, 애니메이션) 확인.
    - 모바일 반응형 디자인 확인.
- **기능 체크**:
    - 프로그램 목록에 더미 데이터가 정상적으로 렌더링되는지 확인.
    - 메인 -> 상세 -> 로그 페이지 간 라우팅 동작 확인.
