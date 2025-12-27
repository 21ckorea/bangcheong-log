'use server';

import { prisma } from '@/lib/db';
import { Program } from '@prisma/client';

export async function getPrograms() {
    try {
        const programs = await prisma.program.findMany({
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

export async function createProgram(data: {
    title: string;
    category: string;
    broadcaster: string;
    recordDate: Date;
    applyStartDate: Date;
    applyEndDate: Date;
    castData: string;
}) {
    try {
        const program = await prisma.program.create({
            data,
        });
        return { success: true, data: program };
    } catch (error) {
        console.error('Failed to create program:', error);
        return { success: false, error: 'Failed to create program' };
    }
}
