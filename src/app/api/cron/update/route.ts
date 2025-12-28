import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { crawlKBS } from '@/lib/crawler/kbs';
import { crawlSBS } from '@/lib/crawler/sbs';
import { crawlJTBC } from '@/lib/crawler/jtbc';
import { crawlTVChosun } from '@/lib/crawler/tvchosun';
// MBC is currently disabled in crawler code
import { crawlMBC } from '@/lib/crawler/mbc';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds (Vercel max for Hobby)

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const authHeader = request.headers.get('authorization');

        // Check for secret in query param or Authorization header
        if (
            secret !== process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Starting scheduled crawl...');

        // Run crawlers in parallel
        const [kbsData, sbsData, jtbcData, tvChosunData, mbcData] = await Promise.all([
            crawlKBS(),
            crawlSBS(),
            crawlJTBC(),
            crawlTVChosun(),
            crawlMBC()
        ]);

        const allPrograms = [
            ...kbsData,
            ...sbsData,
            ...jtbcData,
            ...tvChosunData,
            ...mbcData
        ];

        console.log(`Crawled ${allPrograms.length} programs total.`);

        let updatedCount = 0;
        let createdCount = 0;

        for (const program of allPrograms) {
            const existing = await prisma.program.findFirst({
                where: {
                    title: program.title,
                    // Check logic: usually verify by title + broadcaster.
                    // If we have unique logic, use it.
                    // For now, let's assume title + broadcaster is close enough unique key or valid update target.
                    broadcaster: program.broadcaster,
                }
            });

            // Convert applyEnd (Date | null | undefined) to Date | null for Prisma
            // Prisma expects exact Date object or null.
            const applyEndDate = program.applyEnd ? new Date(program.applyEnd) : new Date(2099, 11, 31); // Default far future if null? 
            // Or schema says applyEndDate DateTime (not optional). Let's check schema.
            // Schema: applyEndDate DateTime. Meaning it MUST be present.
            // Our crawler type says applyEnd?: Date | null.
            // Need a fallback.

            // Wait, schema check:
            // applyEndDate DateTime.

            // Let's use a safe fallback if crawler misses it.
            const safeApplyEnd = program.applyEnd || new Date(new Date().setDate(new Date().getDate() + 7)); // +7 days default

            if (existing) {
                // Skip update if manually edited
                if (existing.isManual) {
                    console.log(`Skipping manual program: ${existing.title}`);
                    continue;
                }

                // Update
                await prisma.program.update({
                    where: { id: existing.id },
                    data: {
                        // Update relevant fields like dates if changed
                        recordDate: program.normalizedDate || new Date(),
                        applyEndDate: safeApplyEnd,
                        link: program.link,
                        image: program.image,
                        // Update castData if we have it? Crawlers don't fetch cast yet.
                    }
                });
                updatedCount++;
            } else {
                // Create
                await prisma.program.create({
                    data: {
                        title: program.title,
                        broadcaster: program.broadcaster,
                        category: 'Music/Talk', // Default category
                        recordDate: program.normalizedDate || new Date(),
                        applyStartDate: new Date(), // Just set to now if unknown
                        applyEndDate: safeApplyEnd,
                        castData: '[]', // Default empty JSON
                        link: program.link,
                        image: program.image,
                    }
                });
                createdCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Crawl completed. Created: ${createdCount}, Updated: ${updatedCount}`,
            total: allPrograms.length
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
