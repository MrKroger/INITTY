import { db } from "@/db";
import { eventBoardItems, events, chats } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { EventBoardClient } from "@/components/EventBoardClient";

async function EventBoardPage({ params }: { params: Promise<{ id: string }> }) {
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

      <EventBoardClient
        eventId={id}
        initialItems={boardItems}
        isCreator={isCreator}
        creatorName={event.creator.name}
      />
    </div>
  );
}

export default EventBoardPage;