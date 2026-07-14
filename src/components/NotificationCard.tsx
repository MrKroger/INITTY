"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X as Close } from "lucide-react";
import { markNotificationAsRead, handleEventApplication } from "@/lib/actions";

interface NotificationCardProps {
  notification: {
    id: string;
    type: string;
    isRead: boolean;
    eventId: string | null;
    applicationStatus?: string | null;
    fromUser?: {
      name: string;
    } | null;
    event?: {
      title: string;
    } | null;
  };
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [statusAction, setStatusAction] = useState<"approved" | "rejected" | null>(
    notification.applicationStatus === "approved" || notification.applicationStatus === "rejected"
      ? notification.applicationStatus
      : null
  );

  useEffect(() => {
    if (notification.isRead) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timerRef.current = setTimeout(async () => {
              try {
                await markNotificationAsRead(notification.id);
              } catch (error) {
                console.error("Не удалось прочитать уведомление", error);
              }
            }, 1000);
          } else {
            if (timerRef.current) clearTimeout(timerRef.current);
          }
        });
      },
      { threshold: 0.7 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      observer.disconnect();
    };
  }, [notification.id, notification.isRead]);

  const fromUserName = notification.fromUser?.name || "Пользователь";

  return (
    <div 
      ref={cardRef} 
      className={`p-4 border-b transition-colors flex items-center justify-between gap-4 ${
        notification.isRead ? "bg-white" : "bg-pink-50/40 font-medium"
      }`}
    >
      <div className="text-sm text-gray-800 flex-1">
        {notification.type === "join_request" && (
          <p>
            <span className="font-bold">{fromUserName}</span> хочет вступить в ваше событие{" "}
            <span className="font-semibold text-pink-600">«{notification.event?.title || "Без названия"}»</span>
          </p>
        )}

        {notification.type === "new_member" && (
          <p>
            <span className="font-bold">{fromUserName}</span> присоединился к вашему событию{" "}
            <span className="font-semibold text-pink-600">«{notification.event?.title || "Без названия"}»</span>
          </p>
        )}

        {notification.type === "join_accepted" && (
          <p>Ваша заявка на событие была одобрена! 🎉</p>
        )}
      </div>

      {notification.type === "join_request" && (
        <div className="flex gap-2 shrink-0 text-sm font-semibold">
          {statusAction === null ? (
            <>
              <form 
                action={async () => { 
                  setStatusAction("approved");
                  await handleEventApplication(notification.id, "approved"); 
                }}
              >
                <button type="submit" className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors cursor-pointer shadow-sm">
                  <Check size={15} />
                </button>
              </form>
              <form 
                action={async () => { 
                  setStatusAction("rejected");
                  await handleEventApplication(notification.id, "rejected"); 
                }}
              >
                <button type="submit" className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer shadow-sm">
                  <Close size={15} />
                </button>
              </form>
            </>
          ) : statusAction === "approved" ? (
            <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs border border-green-200 animate-fade-in">
              Одобрена
            </span>
          ) : (
            <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-md text-xs border border-red-200 animate-fade-in">
              Отклонена
            </span>
          )}
        </div>
      )}
    </div>
  );
}