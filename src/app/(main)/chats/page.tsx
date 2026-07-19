import { db } from "@/db";
import { chatParticipants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { UserAvatar } from "@/components/UserAvatar";
import { eq, ne } from "drizzle-orm";
import { Users, MessageSquare } from "lucide-react";
import Link from "next/link";

async function ChatsPage() {
  const session = await getSession();
  if (!session) return null;

  const myChats = await db.query.chatParticipants.findMany({
    where: eq(chatParticipants.userId, session.id),
    with: {
      chat: {
        with: {
          participants: { 
            where: ne(chatParticipants.userId, session.id),
            with: { 
              user: {
                with: {avatar: true}
              }
            }
          },
          event: true,
        }
      }
    }
  });

  const direct = myChats.filter(c => c.chat.type === "direct");
  const groups = myChats.filter(c => c.chat.type === "group");

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-6 py-4 border-b"><h1 className="text-xl font-bold">Сообщения</h1></header>
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-4">Совпадения</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {direct.map(c => {
              const partner = c.chat.participants[0]?.user;
              if (!partner) return null;

              return (
                <Link key={c.chat.id} href={`/chats/${c.chat.id}`} className="flex flex-col items-center gap-1 min-w-[70px]">
                  <UserAvatar 
                    avatar={partner.avatar} 
                    userId={partner.id} 
                    userName={partner.name || "User"} 
                    className="w-16 h-16"
                    withBorder={true}
                  />
                  <span className="text-[10px] font-bold truncate w-full text-center">{partner.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="border-t p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase mb-4">Группы событий</h2>
          <div className="space-y-2">
            {groups.map(c => (
              <Link key={c.chat.id} href={`/events/${c.chat.eventId}/board`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-500"><Users size={24} /></div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{c.chat.event?.title}</h3>
                  <p className="text-[10px] text-gray-500">Нажмите, чтобы открыть доску</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatsPage;