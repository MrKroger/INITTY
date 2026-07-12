import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NotificationCard } from "@/components/NotificationCard";

export default async function NotificationsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const myNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, user.id),
    orderBy: [desc(notifications.createdAt)],
    with: {
      fromUser: {
        columns: { name: true, imageUrl: true }
      },
      event: {
        columns: { title: true }
      }
    },
  });

  return (
    <div className="flex flex-col h-full bg-white text-black">
      <header className="px-6 py-4 border-b bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold">Уведомления</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {myNotifications.length === 0 ? (
          <p className="text-center text-gray-400 mt-8 text-sm">У вас нет новых уведомлений</p>
        ) : (
          <div className="flex flex-col">
            {myNotifications.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}