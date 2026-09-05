import { readDashboardData } from "@/db/read-model";
import { SystemVivoWorkspace } from "@/components/system-vivo-workspace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await readDashboardData();
  return <SystemVivoWorkspace data={data} />;
}
