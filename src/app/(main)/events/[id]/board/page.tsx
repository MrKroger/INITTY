import { db } from "@/db";
import { eventBoardItems, events, chats } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { addBoardItem } from "@/lib/actions/addBoardItem";

async function EventBoardPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
    with: { creator: true }
  });
  if (!event) notFound();

  const boardItems = await db.query.eventBoardItems.findMany({
    where: eq(eventBoardItems.eventId, id),
    orderBy: [desc(eventBoardItems.createdAt)],
  });

  const chat = await db.query.chats.findFirst({ where: eq(chats.eventId, id) });
  const isCreator = event.creatorId === session.id;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="px-6 py-4 bg-white border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/chats"><ArrowLeft size={24} /></Link>
          <div>
            <h1 className="font-bold text-sm truncate max-w-[120px]">{event.title}</h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Доска</p>
          </div>
        </div>
        {chat && (
          <Link href={`/chats/${chat.id}`} className="bg-pink-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg active:scale-95">
            <MessageCircle size={16} /> Чат
          </Link>
        )}
      </header>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-24">
        {isCreator && (
          <form action={async (fd) => { "use server"; await addBoardItem(id, fd.get("content") as string); }} className="bg-white p-4 rounded-2xl border-2 border-pink-100 space-y-2">
            <textarea name="content" placeholder="Важное объявление..." className="w-full p-3 text-sm bg-gray-50 rounded-xl resize-none outline-none focus:ring-1 ring-pink-500" rows={3} required />
            <button className="w-full py-2 bg-pink-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Send size={14} /> Опубликовать</button>
          </form>
        )}
        <div className="space-y-4">
          {boardItems.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 relative shadow-sm">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500" />
              <p className="text-sm text-gray-800 leading-relaxed">{item.content}</p>
              <div className="mt-4 text-[9px] text-gray-400 font-bold flex justify-between uppercase">
                <span>{event.creator.name}</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventBoardPage;