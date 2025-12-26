# 백엔드 및 데이터베이스 구축 계획 (Backend and Database Setup Plan)

## 사용자 검토 필요 (User Review Required)
> [!NOTE]
> 요청하신 대로 **Vercel Postgres (PostgreSQL)**를 사용합니다.
> Vercel 프로젝트를 연결하거나 `.env` 파일에 `POSTGRES_PRISMA_URL` 및 `POSTGRES_URL_NON_POOLING` 정보를 제공해야 합니다.

## 제안된 변경 사항 (Proposed Changes)

### 설정 및 의존성 (Configuration & Dependencies)
#### [신규] `prisma/schema.prisma`
- PostgreSQL 공급자로 Prisma를 초기화합니다.
- `User` 모델 정의:
  - `id` (String, UUID)
  - `email` (String, 고유값)
  - `name` (String?)
  - `keywords` (String) - 단순 키워드 관심사를 위해 쉼표로 구분된 문자열 또는 JSON 저장.
  - `createdAt`, `updatedAt`
- `Program` 모델 정의:
  - `id` (String, UUID)
  - `title` (String) - 방송명
  - `category` (String) - 예: "음악", "토크"
  - `broadcaster` (String) - 예: "KBS", "MBC"
  - `recordDate` (DateTime)
  - `applyStartDate` (DateTime)
  - `applyEndDate` (DateTime)
  - `castData` (String) - 출연진 정보를 위한 JSON 또는 텍스트
  - `createdAt`, `updatedAt`

#### [신규] `src/lib/db.ts`
- Next.js 핫 리로딩 중 다중 인스턴스 생성을 방지하기 위해 PrismaClient 싱글톤을 생성합니다.

### 서버 액션 (Server Actions)
#### [신규] `src/app/actions/program.ts`
- `getPrograms()` 구현: 모든 방청 정보를 가져옵니다 (추후 더미 데이터를 대체).
- `createProgram(data)` 구현: 테스트/관리자용 데이터 생성.

### 프론트엔드 통합 (Frontend Integration)
#### [수정] 홈 페이지 / 방청 목록 컴포넌트
- 방청 목록을 표시하는 컴포넌트를 식별합니다 (아마도 `src/app/page.tsx` 또는 자식 컴포넌트).
- 하드코딩된 더미 데이터를 `getPrograms()` 비동기 호출로 대체합니다.
- 필요한 경우 로딩/빈 상태를 처리합니다.

## 검증 계획 (Verification Plan)

### 자동화 테스트 (Automated Tests)
- 현재 없음.

### 수동 검증 (Manual Verification)
1.  **Prisma Studio**:
    - `npx prisma studio`를 실행하여 데이터베이스 UI를 검사하고 수동으로 `Program` 항목을 생성해봅니다.
2.  **스크립트 검증**:
    - 임시 스크립트 `src/scripts/test-db.ts`를 생성하여 DB 연결 및 쿼리를 테스트합니다.
