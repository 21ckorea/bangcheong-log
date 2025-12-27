
# Walkthrough - Crawler & Frontend Integration

## Completed Features

### 1. KBS Crawler Implementation
- **Hybrid Strategy**: 
    - **Music Bank**: Uses internal API (`/board/v1/list_board`).
    - **Gag Concert**: Scrapes the separate Ticket System (`kbsticket.kbs.co.kr`).
- **Encoding Issue Solved**: 
    - The ticket system used legacy `EUC-KR` encoding, causing garbled text (Mojibake).
    - **Solution**: Used `iconv-lite` to properly decode the binary response buffer.
    - **Headers**: Added browser-mimicking headers (`User-Agent`, `Referer`, `Sec-Fetch-*`) to bypass blocking.
- **Data Cleanup**:
    - **Announcement Date**: Extracted the "Announcement" date from the HTML to use as the application deadine (`applyEndDate`).
    - **Time Parsing**: Updated utilities to parse HH:mm time from strings like "2026.01.14 (수) 19:00".
    - **Duplicate Prevention**: Implemented robust upsert logic in `route.ts` to merge time-less and time-aware records by matching Title + Broadcaster + Date(YYYY-MM-DD).

### 2. Frontend Integration (Home Page)
- **Real Data**: `HomeClient.tsx` now renders data fetched from the Postgres database.
- **D-Day Badge**:
    - Fixed D-Day calculation logic.
    - **UI Polish**: Changed from semi-transparent to solid white/black high-contrast badge for better visibility.
- **Card Layout**:
    - **Broadcaster Name**: Moved from the gradient image area to the content area (next to category badge) to prevent overlap.
    - **Date Display**: Shows both "Recording Date" and "Announcement Date". If time is present, it's displayed (e.g. `19:00`).
    - **Interaction**: "Detailed View" button now opens the actual application link in a new tab.

## Verification Results
- **Crawler Test**: Successfully crawled upcoming Gag Concert tickets.
- **DB Check**: Verified data is stored correctly in Vercel Postgres.
- **UI Check**: User confirmed correct dates, no overlaps, and button functionality.

## Next Steps
- Implement **MBC** (Show! Music Core) Crawler.
- Implement **SBS** (Inkigayo) Crawler.
- Implement **User Authentication** (Login/Signup).
