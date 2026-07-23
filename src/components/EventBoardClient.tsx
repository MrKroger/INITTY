"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { addBoardItem } from "@/lib/actions/addBoardItem";
import { useSSE } from "@/components/providers/SSEProvider";

interface BoardItem {
  id: string;
  eventId: string;
  content: string;
  createdAt: Date | string;
}

interface EventBoardClientProps {
  eventId: string;
  initialItems: BoardItem[];
  isCreator: boolean;
  creatorName: string;
}

function EventBoardClient({
  eventId,
  initialItems,
  isCreator,
  creatorName,
}: EventBoardClientProps) {
  const [items, setItems] = useState<BoardItem[]>(initialItems);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { lastMessage, markEventAsRead} = useSSE();

  useEffect(() => {
  if (eventId) {
    markEventAsRead(eventId);
  }
}, [eventId, markEventAsRead]);

useEffect(() => {
  if (!lastMessage) return;

  if (
    lastMessage.type === "NEW_BOARD_ITEM" &&
    lastMessage.eventId === eventId &&
    lastMessage.item
  ) {
    const newItem = lastMessage.item;
    setItems((prev) => {
      if (prev.some((item) => item.id === newItem.id)) return prev;
      return [newItem, ...prev];
    });

    markEventAsRead(eventId);
  }
}, [lastMessage, eventId, markEventAsRead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addBoardItem(eventId, content);
      setContent("");
    } catch (error) {
      console.error("Ошибка при публикации объявления:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-24">
      {isCreator && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-2xl border-2 border-pink-100 space-y-2"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Важное объявление..."
            className="w-full p-3 text-sm bg-gray-50 rounded-xl resize-none outline-none focus:ring-1 ring-pink-500"
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-pink-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send size={14} /> {isSubmitting ? "Публикация..." : "Опубликовать"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl border border-gray-100 relative shadow-sm transition-all"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500 rounded-l-2xl" />
            <p className="text-sm text-gray-800 leading-relaxed">
              {item.content}
            </p>
            <div className="mt-4 text-[9px] text-gray-400 font-bold flex justify-between uppercase">
              <span>{creatorName}</span>
              <span>
                {new Date(item.createdAt).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { EventBoardClient };