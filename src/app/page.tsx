
import { getPrograms } from "@/app/actions/program";
import { getFavoritePrograms } from "@/app/actions/user";
import { getApplicationLogs } from "@/app/actions/log";
import { auth } from "@/lib/auth.config";
import HomeClient from "@/components/home/HomeClient";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: 'active' | 'closing' | 'all'; broadcaster?: string }>;
}) {
  // Start independent fetches immediately
  const paramsPromise = searchParams;
  const sessionPromise = auth();

  // Await params to start programs fetch (params is fast)
  const params = await paramsPromise;

  const programsPromise = getPrograms({
    search: params.search,
    status: params.status,
    broadcaster: params.broadcaster,
  });

  const session = await sessionPromise;

  // Prepare user-dependent fetches
  let favoritesPromise = Promise.resolve({ success: true, data: [] } as any);
  let logsPromise = Promise.resolve({ success: true, data: [] } as any);

  if (session?.user) {
    favoritesPromise = getFavoritePrograms();
    logsPromise = getApplicationLogs();
  }

  const [programsResult, favoritesResult, logsResult] = await Promise.all([
    programsPromise,
    favoritesPromise,
    logsPromise
  ]);

  const programs = programsResult.success && programsResult.data ? programsResult.data : [];

  let favoriteIds: string[] = [];
  let loggedProgramIds: string[] = [];

  if (favoritesResult.success && favoritesResult.data) {
    favoriteIds = favoritesResult.data.map((fav: any) => fav.program.id);
  }

  if (logsResult.success && logsResult.data) {
    loggedProgramIds = logsResult.data.map((log: any) => log.program.id);
  }

  return <HomeClient programs={programs} favoriteIds={favoriteIds} loggedProgramIds={loggedProgramIds} />;
}
