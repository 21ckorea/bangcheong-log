import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { crawlKBS } from '@/lib/crawler/kbs';
import { crawlMBC } from '@/lib/crawler/mbc';
import { crawlSBS } from '@/lib/crawler/sbs';
import { crawlKBSDiscovery } from '@/lib/crawler/discovery/kbs-discovery';
import { crawlJTBC } from '@/lib/crawler/jtbc';
import { crawlTVChosun } from '@/lib/crawler/tvchosun';

export async function POST() { // Use POST for manual triggering
    try {
        console.log('Starting crawler job...');

        // 1. Run Crawlers (Parallel)
        const [kbsData, mbcData, sbsData, discoveryData, jtbcData, tvChosunData] = await Promise.all([
            crawlKBS(),
            crawlMBC(),
            crawlSBS(),
            crawlKBSDiscovery(),
            crawlJTBC(),
            crawlTVChosun()
        ]);

        const allData = [...kbsData, ...mbcData, ...sbsData, ...discoveryData, ...jtbcData, ...tvChosunData];
        let createdCount = 0;
        let updatedCount = 0;

        // 2. Upsert Data to DB
        for (const item of allData) {
            // Logic:
            // - Unique constraint: We might not have a perfect unique ID from the crawl unless we use link or title+date.
            // - For now, let's look up by title + broadcaster.

            // Improved duplicate detection:
            // Find programs with same title & broadcaster, then check date proximity.
            // This avoids creating duplicates when time info is added (e.g., 00:00 -> 19:00).
            const candidates = await prisma.program.findMany({
                where: {
                    title: item.title,
                    broadcaster: item.broadcaster,
                }
            });

            let existing = candidates.find(c => {
                // Check if date matches (ignoring time if needed, or simply same day)
                // Simple check: Same YYYY-MM-DD
                const d1 = new Date(c.recordDate);
                const d2 = item.normalizedDate ? new Date(item.normalizedDate) : new Date();
                return d1.getFullYear() === d2.getFullYear() &&
                    d1.getMonth() === d2.getMonth() &&
                    d1.getDate() === d2.getDate();
            });

            if (existing) {
                // Update specific fields if they changed (e.g. time added to recordDate, or applyEndDate)
                const dataToUpdate: any = {};

                // If new date has time and old doesn't, update recordDate
                if (item.normalizedDate && existing.recordDate.getTime() !== item.normalizedDate.getTime()) {
                    dataToUpdate.recordDate = item.normalizedDate;
                }

                if (item.applyEnd && existing.applyEndDate?.getTime() !== item.applyEnd.getTime()) {
                    dataToUpdate.applyEndDate = item.applyEnd;
                }

                // Always update castData to ensure links/guides are fresh
                const newCastData = JSON.stringify({ link: item.link, guideLink: (item as any).guideLink });
                if (existing.castData !== newCastData) {
                    dataToUpdate.castData = newCastData;
                }

                if (Object.keys(dataToUpdate).length > 0) {
                    await prisma.program.update({
                        where: { id: existing.id },
                        data: dataToUpdate
                    });
                    updatedCount++;
                }
            } else {
                await prisma.program.create({
                    data: {
                        title: item.title,
                        broadcaster: item.broadcaster,
                        category: item.title.includes('개그') ? '공개방송' : '음악방송', // Simple category heuristic
                        recordDate: item.normalizedDate || new Date(), // Fallback to now if date parse fails
                        applyStartDate: new Date(), // We don't have exact start/end from list API yet
                        applyEndDate: item.applyEnd || new Date(), // Use crawled announcement date
                        castData: JSON.stringify({ link: item.link, guideLink: (item as any).guideLink }), // Store links
                    }
                });
                createdCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Crawled ${allData.length} items. Created ${createdCount}, Updated ${updatedCount}.`,
            data: allData
        });

    } catch (error) {
        console.error('Crawler job failed:', error);
        return NextResponse.json({ success: false, error: 'Crawler failed' }, { status: 500 });
    }
}

export async function GET() { // Allow GET for easier browser testing
    return POST();
}
