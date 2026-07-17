import { db } from "@/db";
import { notifications, eventApplications } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, inArray } from "drizzle-orm";
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

  const joinRequestIds = myNotifications
    .filter((n) => n.type === "join_request")
    .map((n) => n.id);

  const applicationStatuses: Record<string, string> = {};

  if (joinRequestIds.length > 0) {
    const apps = await db
      .select({ id: eventApplications.id, status: eventApplications.status })
      .from(eventApplications)
      .where(inArray(eventApplications.id, joinRequestIds));

    apps.forEach((app) => {
      applicationStatuses[app.id] = app.status;
    });
  }

  const notificationsWithStatus = myNotifications.map((n) => ({
    ...n,
    applicationStatus: applicationStatuses[n.id] || null,
  }));

  return (
    <div className="flex flex-col h-full bg-white text-black">
      <header className="px-6 py-4 border-b bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold">Уведомления</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {notificationsWithStatus.length === 0 ? (
          <p className="text-center text-gray-400 mt-8 text-sm">У вас нет новых уведомлений</p>
        ) : (
          <div className="flex flex-col">
            {notificationsWithStatus.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}