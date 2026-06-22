import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/data";

// Revalida no servidor a cada 5 min; o cliente também faz polling.
export const revalidate = 300;

export default async function Page() {
  const data = await getDashboardData();
  return <Dashboard initial={data} />;
}
