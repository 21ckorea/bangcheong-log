
import { getPrograms } from "@/app/actions/program";
import HomeClient from "@/components/home/HomeClient";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

export default async function Home() {
  const { success, data } = await getPrograms();
  const programs = success && data ? data : [];

  return <HomeClient programs={programs} />;
}
