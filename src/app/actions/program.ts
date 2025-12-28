'use server';

import { prisma } from '@/lib/db';
import { Program } from '@prisma/client';

export async function getPrograms(options?: {
    search?: string;
    status?: 'active' | 'closing' | 'all';
    broadcaster?: string;
}) {
    try {
        const where: any = {};
        const now = new Date();

        // Search Filter
        if (options?.search) {
            where.OR = [
                { title: { contains: options.search, mode: 'insensitive' } },
                { broadcaster: { contains: options.search, mode: 'insensitive' } },
            ];
        }

        // Broadcaster Filter
        if (options?.broadcaster && options.broadcaster !== 'all') {
            where.broadcaster = { contains: options.broadcaster, mode: 'insensitive' };
        }

        // Status Filter
        if (options?.status) {
            if (options.status === 'active') {
                where.applyEndDate = { gte: now };
            } else if (options.status === 'closing') {
                const threeDaysLater = new Date(now);
                threeDaysLater.setDate(now.getDate() + 3);
                where.applyEndDate = {
                    gte: now,
                    lte: threeDaysLater,
                };
            }
        }

        const programs = await prisma.program.findMany({
            where,
            orderBy: {
                applyEndDate: 'asc',
            },
        });
        return { success: true, data: programs };
    } catch (error) {
        console.error('Failed to fetch programs:', error);
        return { success: false, error: 'Failed to fetch programs' };
    }
}

export async function getProgram(id: string) {
    try {
        const program = await prisma.program.findUnique({
            where: { id },
        });
        return { success: true, data: program };
    } catch (error) {
        console.error('Failed to fetch program:', error);
        return { success: false, error: 'Failed to fetch program' };
    }
}

export async function createProgram(data: {
    title: string;
    category: string;
    broadcaster: string;
    recordDate: Date;
    applyStartDate: Date;
    applyEndDate: Date;
    castData?: string | null;
}) {
    try {
        const program = await prisma.program.create({
            data: {
                ...data,
                castData: data.castData ?? '[]'
            },
        });
        return { success: true, data: program };
    } catch (error) {
        console.error('Failed to create program:', error);
        return { success: false, error: 'Failed to create program' };
    }
}
