"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth.config";

export async function getAdminStats() {
    const session = await auth();

    // Basic security check (should ideally check role too, assuming protected route or admin check in component)
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const [userCount, programCount, logCount, requestCount, reviewCount] = await Promise.all([
            prisma.user.count(),
            prisma.program.count(),
            prisma.applicationLog.count(),
            prisma.programRequest.count({ where: { status: "pending" } }),
            prisma.review.count(),
        ]);

        return {
            success: true,
            data: {
                userCount,
                programCount,
                logCount,
                requestCount,
                reviewCount,
            },
        };
    } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}

export async function getTrendData(type: 'users' | 'requests' | 'logs' | 'programs') {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        let tableName = "";
        switch (type) {
            case 'users': tableName = '"User"'; break;
            case 'requests': tableName = '"ProgramRequest"'; break;
            case 'logs': tableName = '"ApplicationLog"'; break;
            case 'programs': tableName = '"Program"'; break;
            default: return { success: false, error: "Invalid type" };
        }

        // Using simple query for MVP
        const query = `
      SELECT to_char("createdAt", 'YYYY-MM-DD') as date, count(*)::int as count 
      FROM ${tableName}
      WHERE "createdAt" >= NOW() - INTERVAL '30 days' 
      GROUP BY date 
      ORDER BY date ASC
    `;

        const result = await prisma.$queryRawUnsafe<{ date: string, count: number }[]>(query);

        // Format Result
        const formatted = Array.isArray(result) ? result.map(r => ({
            date: r.date,
            count: Number(r.count)
        })) : [];

        return { success: true, data: formatted };
    } catch (error) {
        console.error("Failed to fetch trend:", error);
        return { success: false, error: "Failed to fetch trend" };
    }
}
