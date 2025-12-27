
import { getPrograms } from "@/app/actions/program";
import { getFavoritePrograms } from "@/app/actions/user";
import { getApplicationLogs } from "@/app/actions/log";
import { auth } from "@/lib/auth.config";
import HomeClient from "@/components/home/HomeClient";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

export default async function Home() {
  const session = await auth();
  const { success, data } = await getPrograms();
  const programs = success && data ? data : [];

  // Get user's favorites and logs if logged in
  let favoriteIds: string[] = [];
  let loggedProgramIds: string[] = [];

  if (session?.user) {
    const favoritesResult = await getFavoritePrograms();
    if (favoritesResult.success && favoritesResult.data) {
      favoriteIds = favoritesResult.data.map(fav => fav.program.id);
    }

    const logsResult = await getApplicationLogs();
    if (logsResult.success && logsResult.data) {
      loggedProgramIds = logsResult.data.map(log => log.program.id);
    }
  }

  return <HomeClient programs={programs} favoriteIds={favoriteIds} loggedProgramIds={loggedProgramIds} />;
}
