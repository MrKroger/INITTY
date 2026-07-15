"use client";

import { useState } from "react";
import { SwipeCard } from "./SwipeCard";
import { swipe } from "@/lib/actions/swipe";
import { Heart, X } from "lucide-react";
import { type FeedUser } from "@/app/(main)/page";

export function UserFeedClient({ initialUsers }: { initialUsers: FeedUser[] }) {
  const [users, setUsers] = useState<FeedUser[]>(initialUsers);
  const [currentIndex, setCurrentIndex] = useState(users.length - 1);

  const [isMutating, setIsMutating] = useState(false);

  const handleSwipe = async (direction: "left" | "right") => {
    if (isMutating || currentIndex < 0) return;
    
    const user = users[currentIndex];
    const type = direction === "right" ? "like" : "pass";
    
    setIsMutating(true);

    try {
      const result = await swipe(user.id, type);

      if (result?.match) {
        alert(`Ура! С пользователем ${user.name} взаимная симпатия!`);
      }
      setCurrentIndex((prev) => prev - 1);
    } catch (error: any) {
      alert(error.message || "Произошла непредвиденная ошибка. Попробуйте позже.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="relative w-full h-[600px] max-w-[400px]">
      {users.map((user, index) => {
        const isCurrent = index === currentIndex;
        const isNext = index === currentIndex - 1;

        if (!isCurrent && !isNext) return null;

        return (
          <SwipeCard
            key={user.id}
            user={user}
            onSwipe={isMutating ? () => {} : handleSwipe}
            zIndex={index}
          />
        );
      })} 
      
      {currentIndex < 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border-2 border-dashed border-gray-200">
           <h3 className="text-xl font-bold text-gray-800">Все просмотрены!</h3>
           <p className="text-gray-500 mt-2">Вы просмотрели всех доступных пользователей на сегодня.</p>
        </div>
      )}

      {currentIndex >= 0 && (
        <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-8 z-[100]">
          <button 
            disabled={isMutating}
            onClick={(e) => {
              e.preventDefault();
              handleSwipe("left");
            }}
            className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-red-500 hover:scale-110 transition-transform active:scale-95 border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-9 h-9" />
          </button>
          
          <button 
            disabled={isMutating}
            onClick={(e) => {
              e.preventDefault();
              handleSwipe("right");
            }}
            className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-green-500 hover:scale-110 transition-transform active:scale-95 border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="w-9 h-9 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
}