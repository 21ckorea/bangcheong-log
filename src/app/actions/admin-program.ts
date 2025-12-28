"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth.config";
import { revalidatePath } from "next/cache";

export async function getAdminPrograms(page: number = 1, query: string = "") {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    try {
        const where = query ? {
            OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { broadcaster: { contains: query, mode: 'insensitive' as const } },
            ]
        } : {};

        const [programs, total] = await Promise.all([
            prisma.program.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.program.count({ where })
        ]);

        return {
            success: true,
            data: programs,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    } catch (error) {
        console.error("Failed to fetch admin programs:", error);
        return { success: false, error: "Failed to fetch programs" };
    }
}

export async function updateProgram(id: string, data: any) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.program.update({
            where: { id },
            data: {
                ...data,
                isManual: true, // Always lock on manual edit
            }
        });

        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to update program:", error);
        return { success: false, error: "Failed to update program" };
    }
}

export async function deleteProgram(id: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.program.delete({
            where: { id }
        });

        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete program:", error);
        return { success: false, error: "Failed to delete program" };
    }
}

export async function toggleProgramLock(id: string, isManual: boolean) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.program.update({
            where: { id },
            data: { isManual }
        });

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle lock:", error);
        return { success: false, error: "Failed to toggle lock" };
    }
}
