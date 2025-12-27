
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const programs = await prisma.program.findMany();
        const simplified = programs.map(p => {
            try {
                return {
                    title: p.title,
                    castData: JSON.parse(p.castData)
                };
            } catch {
                return { title: p.title, error: 'Parse failed' };
            }
        });
        return NextResponse.json(simplified);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
