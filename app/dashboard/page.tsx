import { BrandHeader } from "@/components/BrandHeader";
import { DashboardHistoryView } from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <main className="page">
      <BrandHeader />
      <DashboardHistoryView />
    </main>
  );
}
