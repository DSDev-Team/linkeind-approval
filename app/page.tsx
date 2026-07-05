import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getStorage, initStorage } from "@/lib/store-context";
import { groupByWeek } from "@/lib/storage";
import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  await initStorage();
  const store = getStorage();
  const posts = await store.getAllPosts();
  const weeks = groupByWeek(posts);

  return <Dashboard initialWeeks={weeks} initialBackend={store.backendName()} />;
}