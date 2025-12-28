
import { notFound } from "next/navigation";
import { getProgram } from "@/app/actions/program";
import { getComments } from "@/app/actions/comment";
import ProgramDetailClient from "./ProgramDetailClient";

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const programResult = await getProgram(id);

    if (!programResult.success || !programResult.data) {
        notFound();
    }

    const commentsResult = await getComments(id);
    const comments = commentsResult.success && commentsResult.data ? commentsResult.data : [];

    return <ProgramDetailClient program={programResult.data} comments={comments} />;
}
