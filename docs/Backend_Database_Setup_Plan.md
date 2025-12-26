# Backend and Database Setup Plan

## User Review Required
> [!NOTE]
> We will use **Vercel Postgres (PostgreSQL)** as requested.
> You will need to link your Vercel project or provide `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` in your `.env` file.

## Proposed Changes

### Configuration & Dependencies
#### [NEW] `prisma/schema.prisma`
- Initialize Prisma with PostgreSQL provider.
- Define `User` model:
  - `id` (String, UUID)
  - `email` (String, unique)
  - `name` (String?)
  - `keywords` (String) - Store as comma-separated or JSON string for simple keyword interest.
  - `createdAt`, `updatedAt`
- Define `Program` model:
  - `id` (String, UUID)
  - `title` (String) - Broadcast name
  - `category` (String) - e.g. "Music", "Talk"
  - `broadcaster` (String) - e.g. "KBS", "MBC"
  - `recordDate` (DateTime)
  - `applyStartDate` (DateTime)
  - `applyEndDate` (DateTime)
  - `castData` (String) - JSON or text for cast info
  - `createdAt`, `updatedAt`

#### [NEW] `src/lib/db.ts`
- Create a PrismaClient singleton to prevent multiple instances during Next.js hot-reloading.

### Server Actions
#### [NEW] `src/app/actions/program.ts`
- Implement `getPrograms()`: Fetch all programs (replacing dummy data eventually).
- Implement `createProgram(data)`: For testing/admin use.

### Frontend Integration
#### [MODIFY] Home Page / Program List Component
- Identify the component displaying the program list (likely `src/app/page.tsx` or a child component).
- Replace hardcoded dummy data with async call to `getPrograms()`.
- Handle loading/empty states if necessary.

## Verification Plan

### Automated Tests
- None currently.

### Manual Verification
1.  **Prisma Studio**:
    - Run `npx prisma studio` to inspect the database UI and manually create a `Program` entry.
2.  **Script Verification**:
    - Create a temporary script `src/scripts/test-db.ts` to try connecting and querying the DB.
