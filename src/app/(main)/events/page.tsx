import { db } from "@/db";
import { events } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { UserAvatar } from "@/components/UserAvatar";
import Link from "next/link";
import { Plus } from "lucide-react";
import { desc } from "drizzle-orm";
import { cn } from "@/lib/utils";
import { applyToEvent } from "@/lib/actions/applyToEvent";

export default async function EventsPage() {
  const session = await getSession();
  const allEvents = await db.query.events.findMany({
    orderBy: [desc(events.createdAt)],
    with: {
      creator: {
        with: { avatar: true }
      }
    }
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold">События</h1>
        <Link 
          href="/events/create"
          className="p-2 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {allEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Нет активных событий. Будь первым!
          </div>
        ) : (
          allEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      event.type === "open" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                    )}>
                      {event.type === "open" ? "Открытая" : "Закрытая"}
                    </span>
                    <div className="flex gap-1">
                      {event.tags?.split(",").map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px]">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {event.description}
                </p>

                <div className="flex items-center gap-3">
                  <UserAvatar 
                    avatar={event.creator.avatar} 
                    userId={event.creator.id} 
                    userName={event.creator.name || "Пользователь"} 
                    className="w-8 h-8"
                    withBorder={false}
                  />
                  <span className="text-xs text-gray-500 font-medium">Создал: {event.creator.name}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <form action={async () => {
                  "use server";
                  await applyToEvent(event.id);
                }}>
                  <button className="w-full py-2.5 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors active:scale-[0.98]">
                    Подать заявку
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}