import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Header />
      <main className="flex-grow flex flex-col bg-white">
        <DashboardContent />
      </main>
    </div>
  );
}
