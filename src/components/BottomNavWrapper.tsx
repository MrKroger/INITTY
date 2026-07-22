"use client";

import { BottomNav } from "./BottomNav";
import { useSSE } from "./providers/SSEProvider";

export function BottomNavWrapper({ unreadNotificationsCount }: { unreadNotificationsCount: number }) {
  const { hasUnreadChats } = useSSE();

  return (
    <BottomNav
      unreadNotificationsCount={unreadNotificationsCount}
      hasUnreadChats={hasUnreadChats}
    />
  );
}