"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface SSEMessage {
  type: "NEW_BOARD_ITEM";
  eventId: string;
  creatorId?: string;
  item?: any;
}

interface SSEContextType {
  lastMessage: SSEMessage | null;
  unreadEventIds: string[];
  markAsRead: (eventId: string) => void;
  hasUnreadChats: boolean;
}

const SSEContext = createContext<SSEContextType>({
  lastMessage: null,
  unreadEventIds: [],
  markAsRead: () => {},
  hasUnreadChats: false,
});

export function SSEProvider({
  children,
  initialUnreadEventIds,
  userId,
}: {
  children: React.ReactNode;
  initialUnreadEventIds: string[];
  userId: string;
}) {
  const [unreadEventIds, setUnreadEventIds] = useState<string[]>(initialUnreadEventIds);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data);
        setLastMessage(data);

        if (data.type === "NEW_BOARD_ITEM" && data.creatorId !== userId) {
          setUnreadEventIds((prev) => 
            prev.includes(data.eventId) ? prev : [...prev, data.eventId]
          );
        }
      } catch (err) {
        console.error("SSE Error:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);

  const markAsRead = useCallback((eventId: string) => {
    setUnreadEventIds((prev) => {
      if (!prev.includes(eventId)) return prev;
      return prev.filter((id) => id !== eventId);
    });
  }, []);

  const hasUnreadChats = unreadEventIds.length > 0;

  return (
    <SSEContext.Provider value={{ lastMessage, unreadEventIds, markAsRead, hasUnreadChats }}>
      {children}
    </SSEContext.Provider>
  );
}

export const useSSE = () => useContext(SSEContext);