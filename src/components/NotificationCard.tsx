"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X as Close, Heart } from "lucide-react";
import { markNotificationAsRead } from "@/lib/actions/markNotificationAsRead";
import { handleEventApplication } from "@/lib/actions/handleEventApplication";
import { handleLikeResponse } from "@/lib/actions/handleLikeResponse"; // Экшен для обработки лайка
import { UserAvatar } from "@/components/UserAvatar";

interface NotificationCardProps {
  notification: {
    id: string;
    type: string;
    isRead: boolean;
    eventId: string | null;
    applicationStatus?: string | null;
    fromUserId?: string | null;
    fromUser?: {
      id?: string;
      name: string;
      avatar?: any;
    } | null;
    event?: {
      title: string;
    } | null;
  };
}

function NotificationCard({ notification }: NotificationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [statusAction, setStatusAction] = useState<"approved" | "rejected" | null>(
    notification.applicationStatus === "approved" || notification.applicationStatus === "rejected"
      ? (notification.applicationStatus as "approved" | "rejected")
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
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {notification.fromUser && (
          <UserAvatar
            avatar={notification.fromUser.avatar}
            userId={notification.fromUser.id || notification.fromUserId || ""}
            userName={fromUserName}
            className="w-10 h-10 shrink-0"
          />
        )}

        <div className="text-sm text-gray-800 min-w-0">
          {(notification.type === "LIKE" || notification.type === "like") && (
            <p className="leading-snug">
              <span className="font-bold">{fromUserName}</span> хочет познакомиться
            </p>
          )}

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
            <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs border border-green-200">
              Одобрена
            </span>
          ) : (
            <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-md text-xs border border-red-200">
              Отклонена
            </span>
          )}
        </div>
      )}

      {(notification.type === "LIKE" || notification.type === "like") && (
        <div className="flex gap-2 shrink-0 text-sm font-semibold">
          {statusAction === null ? (
            <>
              <form 
                action={async () => { 
                  setStatusAction("approved");
                  if (notification.fromUserId) {
                    await handleLikeResponse(notification.id, notification.fromUserId, "accept");
                  }
                }}
              >
                <button 
                  type="submit" 
                  title="Принять"
                  className="p-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  <Heart size={15} className="fill-white" />
                </button>
              </form>
              <form 
                action={async () => { 
                  setStatusAction("rejected");
                  await handleLikeResponse(notification.id, notification.fromUserId || "", "decline");
                }}
              >
                <button 
                  type="submit" 
                  title="Отклонить"
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors cursor-pointer active:scale-95"
                >
                  <Close size={15} />
                </button>
              </form>
            </>
          ) : statusAction === "approved" ? (
            <span className="text-pink-600 bg-pink-50 px-2.5 py-1 rounded-md text-xs border border-pink-200">
              Взаимность!
            </span>
          ) : (
            <span className="text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md text-xs border border-gray-200">
              Пропущено
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { NotificationCard };