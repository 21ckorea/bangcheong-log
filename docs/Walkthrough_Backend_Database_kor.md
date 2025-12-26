# 백엔드 및 데이터베이스 구축 가이드

**Vercel Postgres**, **Prisma ORM**, 그리고 **Next.js Server Actions**를 사용하여 백엔드 인프라 구축을 완료했습니다.

## 구현된 변경 사항

### 1. 데이터베이스 설정 (Database Configuration)
- **Prisma 7**: Vercel Postgres의 커넥션 풀을 안정적으로 사용하기 위해 `@prisma/adapter-pg`를 적용했습니다.
- **Schema (스키마)**: `prisma/schema.prisma` 파일에 `User`와 `Program` 모델을 정의했습니다.
- **Client Generation (클라이언트 생성)**: 새로운 Prisma 7 어댑터 패턴에서의 모듈 경로 이슈를 해결하기 위해, 타입을 `src/generated/client` 경로로 출력하도록 설정했습니다.

### 2. 데이터베이스 연결 (Database Connection)
- **`src/lib/db.ts`**: `pg` 드라이버 어댑터를 사용하여 싱글톤 Prisma Client 인스턴스를 구현했습니다. 이는 서버리스 환경에서 효율적인 커넥션 풀링을 보장합니다.

### 3. 서버 액션 (Server Actions)
- **`src/app/actions/program.ts`**: `Program` 데이터를 관리하기 위한 초기 Server Action들을 생성했습니다:
  - `getPrograms()`: 모든 방청 정보를 가져옵니다.
  - `createProgram()`: 새로운 방청 정보를 생성합니다 (관리자/초기 데이터용).

## 검증 결과 (Verification Results)

### 수동 검증 (Manual Verification)
- 검증용 스크립트 `src/scripts/test-db.ts`를 작성하여 다음을 수행했습니다:
  1. 실제 Vercel Postgres 데이터베이스에 연결.
  2. 테스트용 `Program` 레코드 생성.
  3. 생성된 데이터를 다시 조회하여 정합성 확인.
  4. 테스트 레코드 삭제.
- **결과**: 성공. 데이터베이스 접근 및 쓰기가 정상적으로 작동함을 확인했습니다.

## 다음 단계 (Next Steps)
- UI에서 임시 데이터(Placeholder) 대신 `getPrograms`를 사용하여 실제 데이터를 표시합니다.
- 데이터베이스를 자동으로 채우기 위한 크롤러(Crawler)를 구현합니다.
