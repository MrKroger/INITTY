import { db } from "@/db";
import { chatParticipants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, ne } from "drizzle-orm";
import { GroupChatItem } from "@/components/GroupChatItem";
import { DirectChatItem } from "@/components/chat/DirectChatItem";

export const dynamic = "force-dynamic";

async function ChatsPage() {
  const session = await getSession();
  if (!session) return null;

  const myChats = await db.query.chatParticipants.findMany({
    where: eq(chatParticipants.userId, session.id),
    with: {
      chat: {
        with: {
          messages: {
            orderBy: (msgs, { desc }) => [desc(msgs.createdAt)],
            limit: 1,
          },
          participants: { 
            where: ne(chatParticipants.userId, session.id),
            with: { 
              user: {
                with: { avatar: true }
              }
            }
          },
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
            }
          },
        }
      }
    }
  });

  const direct = myChats.filter(c => c.chat.type === "direct");
  const groups = myChats.filter(c => c.chat.type === "group");

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-6 py-4 border-b">
        <h1 className="text-xl font-bold">Сообщения</h1>
      </header>
      <div className="flex-1 overflow-y-auto pb-20">
        
        <div className="p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-4">Совпадения</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {direct.map(c => {
              const partner = c.chat.participants[0]?.user;
              if (!partner) return null;

              const latestMessage = c.chat.messages?.[0];
              const isUnread = Boolean(
                latestMessage &&
                latestMessage.senderId !== session.id &&
                (!c.lastReadAt || new Date(latestMessage.createdAt) > new Date(c.lastReadAt))
              );

              return (
              <DirectChatItem
                key={c.chat.id}
                chatId={c.chat.id}
                currentUserId={session.id} // 👈 Передаем id текущего юзера
                partner={{
                  id: partner.id,
                  name: partner.name || "User",
                  avatar: partner.avatar,
                }}
                initialIsUnread={isUnread}
              />
            );
            })}
          </div>
        </div>

        <div className="border-t p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-4">Группы событий</h2>
          <div className="space-y-2">
            {groups.map(c => {
              const event = c.chat.event;
              if (!event) return null;

              const latestBoardItem = event?.boardItems?.[0];
              const application = event?.applications?.[0];
              const isAuthorOfLatest = latestBoardItem?.creatorId === session.id;

              const hasUnread = Boolean(
                latestBoardItem &&
                  !isAuthorOfLatest &&
                  (!application?.lastBoardReadAt ||
                    new Date(latestBoardItem.createdAt) > new Date(application.lastBoardReadAt))
              );
              
              return (
                <GroupChatItem
                  key={c.chat.id}
                  chatId={c.chat.id}
                  eventId={c.chat.eventId!}
                  eventTitle={event.title}
                  initialHasUnread={hasUnread}
                />
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ChatsPage;