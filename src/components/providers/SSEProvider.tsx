"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SSEContextType {
  unreadEventIds: string[];
  hasUnreadChats: boolean;
  lastMessage: any;
  markEventAsRead: (eventId: string) => void;
  clearUnreadChats: () => void;
}

const SSEContext = createContext<SSEContextType>({
  unreadEventIds: [],
  hasUnreadChats: false,
  lastMessage: null,
  markEventAsRead: () => {},
  clearUnreadChats: () => {},
});

export function SSEProvider({
  children,
  initialUnreadEventIds = [],
  userId,
}: {
  children: React.ReactNode;
  initialUnreadEventIds?: string[];
  userId: string;
}) {
  const [unreadEventIds, setUnreadEventIds] = useState<string[]>(initialUnreadEventIds);
  const [hasUnreadChats, setHasUnreadChats] = useState<boolean>(initialUnreadEventIds.length > 0);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    const eventSource = new EventSource(`/api/sse?userId=${userId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);

        if (data.type === "NEW_BOARD_ITEM" && data.eventId) {
          setUnreadEventIds((prev) => [...new Set([...prev, data.eventId])]);
          setHasUnreadChats(true);
        }

        if (data.type === "NEW_CHAT_MESSAGE") {
          if (data.message?.senderId !== userId) {
            setHasUnreadChats(true);
          }
        }
      } catch (err) {
        console.error("Ошибка парсинга SSE:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);

  const markEventAsRead = (eventId: string) => {
    setUnreadEventIds((prev) => {
      const next = prev.filter((id) => id !== eventId);
      if (next.length === 0) setHasUnreadChats(false);
      return next;
    });
  };

  const clearUnreadChats = () => {
    setHasUnreadChats(false);
  };

  return (
    <SSEContext.Provider
      value={{
        unreadEventIds,
        hasUnreadChats,
        lastMessage,
        markEventAsRead,
        clearUnreadChats,
      }}
    >
      {children}
    </SSEContext.Provider>
  );
}

export const useSSE = () => useContext(SSEContext);