import { AppNavbar } from "@/components/layout/AppNavbar";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function DashboardPage() {
  return (
    <>
      <AppNavbar />
      <ComingSoon
        title="Dashboard coming soon"
        description="Stats, recent activity, and analytics charts land in Phase 5 of the build plan."
      />
    </>
  );
}
