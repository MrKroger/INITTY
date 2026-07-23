"use client";

import { BottomNav } from "./BottomNav";
import { useSSE } from "./providers/SSEProvider";
import { usePathname } from "next/navigation";

export function BottomNavWrapper({ unreadNotificationsCount }: { unreadNotificationsCount: number }) {
  const { hasUnreadChats } = useSSE();

  const pathname = usePathname();

  const isInsideSingleChat = /^\/chats\/.+/.test(pathname);

  if (isInsideSingleChat) {
    return null;
  }
  return (
    <BottomNav
      unreadNotificationsCount={unreadNotificationsCount}
      hasUnreadChats={hasUnreadChats}
    />
  );
}