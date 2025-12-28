import { getMyPageData } from "@/app/actions/mypage";
import MyPageClient from "./MyPageClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyPage() {
    const data = await getMyPageData();

    if (!data) {
        redirect("/"); // Or login page
    }

    return <MyPageClient data={data} />;
}
