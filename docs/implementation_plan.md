# Implementation Plan - Bangcheong-Log

## Goal Description
Build the MVP (Minimum Viable Product) for **Bangcheong-Log**, a web application that aggregates audience application information and allows users to record their experiences. The focus is on a premium, visually appealing mobile-first design targeting the vlog generation.

## User Review Required
> [!IMPORTANT]
> **Tech Stack Selection**: I propose using **Next.js 14 (App Router)** for both frontend and backend API, **Tailwind CSS** for styling, and **SQLite** (via Prisma) for the database to keep local development simple.
>
> **Design Library**: To achieve the "premium" and "dynamic" feel, I will use **Framer Motion** for animations and **Lucide React** for icons.

## Proposed Changes

### Project Initialization
#### [NEW] [bangcheong-log](file:///d:/work/web/Bangcheong_Log)
- Initialize Next.js project: `npx create-next-app@latest .`
  - TypeScript: Yes
  - Tailwind CSS: Yes
  - ESLint: Yes
  - App Router: Yes
  - Import Alias: `@/*`
- Install additional dependencies:
  - `next-intl`: For internationalization (English/Korean).
  - `framer-motion`: For animations.
  - `lucide-react`: For icons.
  - `clsx`, `tailwind-merge`: For utility class management.
  - `prisma`: ORM for database.
  - `cheerio`: For the crawler (simple implementation).

### Component Structure
#### [NEW] [components](file:///d:/work/web/Bangcheong_Log/components)
- **UI System**: Reusable aesthetic components (Cards, Buttons, Inputs).
- **Layout**: Mobile-first layout wrapper with Navigation Bar.
- **I18n**: Locale switcher and localized text wrappers.

### Feature Implementation
#### [NEW] [app](file:///d:/work/web/Bangcheong_Log/app)
- `[locale]/page.tsx`: Main landing page (Localized).
- `[locale]/apply/page.tsx`: Application guide.
- `[locale]/log/page.tsx`: User's log entry page.
- `i18n.ts`: i18n configuration.
- `middleware.ts`: Locale detection and routing middleware.

### Database Schema
#### [NEW] [prisma/schema.prisma](file:///d:/work/web/Bangcheong_Log/prisma/schema.prisma)
- `Program`: Stores show info (Name, Station, Date, Link).
- `User`: (Optional for MVP, maybe just local storage first or simple auth).
- `Log`: User's reviews.

## Verification Plan

### Automated Tests
- Build verification: `npm run build` should pass.
- Lint check: `npm run lint` should pass.

### Manual Verification
- **Visual Check**:
    - Verify "Premium" aesthetic (fonts, colors, animations).
    - Check mobile responsiveness.
- **Functional Check**:
    - Verify program list renders mock data.
    - Verify routing between Main -> Detail -> Log pages.
