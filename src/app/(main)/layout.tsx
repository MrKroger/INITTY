import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { notifications, chatParticipants } from "@/db/schema";
import { and, eq, count } from "drizzle-orm";
import { SSEProvider } from "@/components/providers/SSEProvider";
import { BottomNavWrapper } from "@/components/BottomNavWrapper";

async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.isOnboarded === false) redirect("/onboarding");

  const userChatParticipants = await db.query.chatParticipants.findMany({
    where: eq(chatParticipants.userId, session.id),
    with: {
      chat: {
        with: {
          event: {
            with: {
              boardItems: {
                orderBy: (items, { desc }) => [desc(items.createdAt)],
                limit: 1,
              },
              applications: {
                where: (apps, { eq }) => eq(apps.userId, session.id),
                limit: 1,
              },
            },
          },
        },
      },
    },
  });

  const initialUnreadEventIds: string[] = [];

  userChatParticipants.forEach((p) => {
    const latestItem = p.chat?.event?.boardItems?.[0];
    const app = p.chat?.event?.applications?.[0];
    const eventId = p.chat?.eventId;

    if (!latestItem || !eventId) return;

    const isAuthorOfLatest = latestItem.creatorId === session.id;
    if (isAuthorOfLatest) return;

    const isUnread = !app?.lastBoardReadAt || new Date(latestItem.createdAt) > new Date(app.lastBoardReadAt);
    if (isUnread) {
      initialUnreadEventIds.push(eventId);
    }
  });

  const [result] = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, session.id), eq(notifications.isRead, false)));

  return (
    <SSEProvider initialUnreadEventIds={initialUnreadEventIds} userId={session.id}>
      <div className="min-h-screen bg-gray-50 pb-20 text-black">
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden">
          {children}
        </main>
        <BottomNavWrapper unreadNotificationsCount={result?.value || 0} />
      </div>
    </SSEProvider>
  );
}

export default MainLayout;