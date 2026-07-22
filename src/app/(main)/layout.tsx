import { BottomNav } from "@/components/BottomNav";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, eq, count } from "drizzle-orm";

async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.isOnboarded === false) {
    redirect("/onboarding");
  }

  const [result] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.id),
        eq(notifications.isRead, false)
      )
    );

  const unreadNotificationsCount = result?.value || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-black">

      <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden">
        {children}
      </main>
      <BottomNav unreadNotificationsCount={unreadNotificationsCount} />
    </div>
  );
}

export default MainLayout;