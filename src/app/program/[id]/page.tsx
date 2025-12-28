
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { getProgram } from "@/app/actions/program";
import { getComments } from "@/app/actions/comment";
import ProgramDetailClient from "./ProgramDetailClient";

import { auth } from "@/lib/auth.config";

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const { data: program } = await getProgram(id);

    if (!program) {
        return {
            title: "프로그램을 찾을 수 없습니다",
        };
    }

    let imageUrl = "/og-image.png";
    try {
        const data = JSON.parse(program.castData || '{}');
        if (data.image) imageUrl = data.image;
    } catch (e) { }

    return {
        title: `${program.title} - 방청로그`,
        description: `${program.broadcaster} ${program.category} 방청 신청! 자세한 일정과 정보를 확인하세요.`,
        openGraph: {
            title: `${program.title} | 방청 신청`,
            description: `${program.broadcaster} ${program.category} - ${program.title} 방청 정보`,
            images: [imageUrl],
        },
        twitter: {
            card: "summary_large_image",
            title: program.title,
            description: `${program.broadcaster} ${program.title} 방청 신청`,
            images: [imageUrl],
        }
    };
}

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    const programResult = await getProgram(id);

    if (!programResult.success || !programResult.data) {
        notFound();
    }

    const program = programResult.data;

    const commentsResult = await getComments(id);
    // ProgramDetailClient expects Comment[], but getComments returns (Comment & {user: ...})[]
    // The mismatch is resolved by recent fix to getComments to include user.id
    const comments = commentsResult.success && commentsResult.data ? commentsResult.data : [];

    const getStatus = (p: any) => {
        const now = new Date();
        const end = new Date(p.applyEndDate);
        return now <= end ? 'active' : 'closed';
    };

    return (
        <ProgramDetailClient
            program={{
                ...program,
                status: getStatus(program)
            }}
            initialComments={comments}
            userId={session?.user?.id}
        />
    );
}
