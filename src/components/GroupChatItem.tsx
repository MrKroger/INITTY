"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { useSSE } from "./providers/SSEProvider";

interface GroupChatItemProps {
  chatId: string;
  eventId: string;
  eventTitle: string;
  initialHasUnread: boolean;
}

export function GroupChatItem({
  eventId,
  eventTitle,
  initialHasUnread,
}: GroupChatItemProps) {
  const { unreadEventIds } = useSSE();

  const hasUnread = unreadEventIds.includes(eventId);

  return (
    <Link
      href={`/events/${eventId}/board`}
      className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors relative"
    >
      <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-500 relative">
        <Users size={24} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm">{eventTitle}</h3>
        </div>
        <p className="text-[10px] text-gray-500">Нажмите, чтобы открыть доску</p>
      </div>
    </Link>
  );
}