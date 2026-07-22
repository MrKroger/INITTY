"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Calendar, MessageSquare, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  unreadNotificationsCount?: number;
  hasUnreadChats?: boolean;
}

function BottomNav({ unreadNotificationsCount = 0, hasUnreadChats = false }: BottomNavProps) {
  const pathname = usePathname();

  const items = [
    { icon: Users, label: "Лента", href: "/" },
    { icon: Calendar, label: "События", href: "/events" },
    { 
      icon: MessageSquare, 
      label: "Чаты", 
      href: "/chats",
      hasDot: hasUnreadChats
    },
    { 
      icon: Bell, 
      label: "Уведомления", 
      href: "/notifications",
      badgeCount: unreadNotificationsCount 
    },
    { icon: User, label: "Профиль", href: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-50">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;
        
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "relative flex items-center justify-center w-full h-full transition-colors",
              isActive ? "text-pink-500" : "text-gray-400 hover:text-gray-600"
            )}
            title={item.label}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              
              {Boolean(item.badgeCount && item.badgeCount > 0) && (
                <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center animate-pulse border border-white">
                  {(item.badgeCount ?? 0) > 9 ? "9+" : item.badgeCount}
                </span>
              )}

              {item.hasDot && (
                <span className="absolute -top-0.5 -right-0.5 bg-pink-500 rounded-full h-2.5 w-2.5 border-2 border-white animate-pulse" />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export { BottomNav };