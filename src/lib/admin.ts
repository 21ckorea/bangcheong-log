"use server";

import { auth } from "@/lib/auth.config";

export async function isAdmin() {
    const session = await auth();

    if (!session?.user?.email) {
        return false;
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(email => email.trim()) || [];
    return adminEmails.includes(session.user.email);
}
