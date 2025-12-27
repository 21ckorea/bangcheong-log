# User Authentication System Implementation Plan

## Overview
Implement a complete user authentication system with Google OAuth login, user profiles, and favorite programs functionality.

## Prerequisites

### Google OAuth Setup Required
You'll need to create a Google Cloud Project and obtain OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - Production: `https://bangcheong-log.archion.space/api/auth/callback/google`
   - Development: `http://localhost:3000/api/auth/callback/google`

You'll receive:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

These need to be added to your environment variables.

### Database Schema Changes
This implementation requires adding new tables to the database:
- `User` table for user accounts
- `Account` table for OAuth providers
- `Session` table for user sessions
- `FavoriteProgram` table for user's favorite programs

A database migration will be required.

---

## Implementation Steps

### 1. Database Setup

#### Update Prisma Schema
Add the following models to `prisma/schema.prisma`:

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

Update `Program` model:
```prisma
model Program {
  // ... existing fields
  favorites FavoriteProgram[]
}
```

#### Run Migration
```bash
npx prisma migrate dev --name add_user_auth
npx prisma generate
```

---

### 2. Install Dependencies

```bash
npm install next-auth@beta @auth/prisma-adapter
```

---

### 3. Authentication Configuration

#### Create `src/lib/auth.config.ts`
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

#### Create `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth.config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

#### Update `.env.local`
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

### 4. Server Actions

Create `src/app/actions/user.ts`:

```typescript
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/db";

export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" };
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
    return { success: false, error: "Not authenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { success: false, error: "User not found" };
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

### 5. UI Components

#### Login Button Component
Create `src/components/auth/LoginButton.tsx`

#### User Menu Component
Create `src/components/auth/UserMenu.tsx`

#### Update Header
Modify `src/components/layout/Header.tsx` to include authentication UI

#### Add Favorite Button
Update `src/components/home/HomeClient.tsx` to add favorite button to program cards

#### Profile Page
Create `src/app/profile/page.tsx`

---

## Testing Checklist

- [ ] Google OAuth login flow works
- [ ] User session persists across page reloads
- [ ] Favorite programs can be added/removed
- [ ] Profile page displays user information
- [ ] Logout functionality works
- [ ] Unauthorized access is properly handled

---

## Deployment Notes

1. Add environment variables to Vercel:
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

2. Update Google OAuth authorized redirect URIs with production URL

3. Run database migration on production database
