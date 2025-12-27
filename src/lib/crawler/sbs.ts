
import { CrawledProgramData } from './kbs';

// SBS Inkigayo Rule:
// App only.
// Apply: Tue 10:00 ~ Thu 23:59
// Record: Every Sunday

export const crawlSBS = async (): Promise<CrawledProgramData[]> => {
    console.log(`Generating SBS Inkigayo Schedule...`);
    const results: CrawledProgramData[] = [];

    const now = new Date();
    const todayDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    // Calculate "This Week's" Tuesday (Start) and Thursday (End)
    // We want the application period relevant to the *upcoming* Sunday or *next* Sunday?
    // Usually: Apply Tue-Thu for THIS Sunday's show? No, usually slightly in advance.
    // SBS Guide says: "Tuesday ~ Thursday" -> "Winners Fri" -> "Show Sun".
    // So it's all in the same week.

    // Find the Tuesday of the current week (or previous if today is Sun/Mon)
    // Actually, let's just find the "upcoming" or "current" application window.

    const tuesday = new Date(now);
    const dayDiffToTue = 2 - todayDay; // if today is Wed(3), diff is -1 (yesterday)
    tuesday.setDate(now.getDate() + dayDiffToTue);
    tuesday.setHours(10, 0, 0, 0);

    let thursday = new Date(tuesday);
    thursday.setDate(tuesday.getDate() + 2);
    thursday.setHours(23, 59, 59, 999);

    // If today is past Thursday 23:59, we should show NEXT week's schedule
    if (now > thursday) {
        console.log('Current application window passed. Generating next week schedule.');
        tuesday.setDate(tuesday.getDate() + 7);
        thursday.setDate(thursday.getDate() + 7);
    }

    const sunday = new Date(tuesday);
    sunday.setDate(tuesday.getDate() + 5); // Tue + 5 = Sun
    sunday.setHours(15, 50, 0, 0); // Inkigayo airtime approx

    // Only add if we are reasonably close to this window (e.g. within +/- 7 days)
    // to avoid generating stale past data or too far future.
    // Actually, always generating "This Week's" is fine, DB upsert handles uniqueness.

    results.push({
        title: 'SBS 인기가요 (앱 신청)',
        broadcaster: 'SBS',
        date: `매주 일요일 15:50`,
        normalizedDate: sunday,
        link: 'https://programs.sbs.co.kr/enter/gayo/basicinfo/83552',
        isApplying: true, // Always "applying" in the sense that it's recurring
        applyEnd: thursday, // Application deadline
        image: 'https://img2.sbs.co.kr/img/sbs_cms/WE/2025/10/29/gPm1761716656469-640-360.jpg',
    });

    console.log(`Generated SBS Inkigayo for Sunday ${sunday.toLocaleDateString()}`);

    return results;
};
