"use server";

import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";

export async function createApplicationLog(programId: string, status: string = "applied", notes?: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const log = await prisma.applicationLog.create({
            data: {
                userId: session.user.id,
                programId,
                status,
                notes,
            },
            include: {
                program: true,
            },
        });

        return { success: true, data: log };
    } catch (error) {
        return { success: false, error: "Failed to create log" };
    }
}

export async function getApplicationLogs() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const logs = await prisma.applicationLog.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                program: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return { success: true, data: logs };
    } catch (error) {
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function updateApplicationStatus(logId: string, status: string, notes?: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const log = await prisma.applicationLog.update({
            where: {
                id: logId,
                userId: session.user.id,
            },
            data: {
                status,
                notes,
            },
            include: {
                program: true,
            },
        });

        return { success: true, data: log };
    } catch (error) {
        return { success: false, error: "Failed to update status" };
    }
}

export async function deleteApplicationLog(logId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.applicationLog.delete({
            where: {
                id: logId,
                userId: session.user.id,
            },
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete log" };
    }
}

export async function checkApplicationLog(programId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, hasLog: false };
    }

    try {
        const log = await prisma.applicationLog.findFirst({
            where: {
                userId: session.user.id,
                programId,
            },
        });

        return { success: true, hasLog: !!log, log };
    } catch (error) {
        return { success: false, hasLog: false };
    }
}
