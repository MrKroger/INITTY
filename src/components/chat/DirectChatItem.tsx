"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { useSSE } from "@/components/providers/SSEProvider";

interface DirectChatItemProps {
  chatId: string;
  currentUserId: string;
  partner: {
    id: string;
    name: string;
    avatar: any;
  };
  initialIsUnread: boolean;
}

export function DirectChatItem({
  chatId,
  currentUserId,
  partner,
  initialIsUnread,
}: DirectChatItemProps) {
  const [isUnread, setIsUnread] = useState(initialIsUnread);
  const [wasClicked, setWasClicked] = useState(false);
  const { lastMessage } = useSSE();

  useEffect(() => {
    if (!wasClicked) {
      setIsUnread(initialIsUnread);
    }
  }, [initialIsUnread, wasClicked]);

  useEffect(() => {
    if (!lastMessage) return;

    if (
      lastMessage.type === "NEW_CHAT_MESSAGE" &&
      lastMessage.chatId === chatId
    ) {
      const incomingSenderId = lastMessage.message?.senderId;

      if (incomingSenderId && incomingSenderId !== currentUserId) {
        setWasClicked(false);
        setIsUnread(true);
      }
    }
  }, [lastMessage, chatId, currentUserId]);

  const handleClick = () => {
    setWasClicked(true);
    setIsUnread(false);
  };

  return (
    <Link
      href={`/chats/${chatId}`}
      onClick={handleClick}
      className="flex flex-col items-center gap-1 min-w-[70px]"
    >
      <UserAvatar
        avatar={partner.avatar}
        userId={partner.id}
        userName={partner.name || "User"}
        className={`w-16 h-16 transition-all duration-300 ${
          isUnread
            ? "ring-2 ring-pink-500 ring-offset-2 scale-105"
            : "ring-1 ring-gray-200"
        }`}
      />
      <span
        className={`text-[10px] truncate w-full text-center ${
          isUnread ? "font-bold text-pink-600" : "font-semibold text-gray-700"
        }`}
      >
        {partner.name}
      </span>
    </Link>
  );
}