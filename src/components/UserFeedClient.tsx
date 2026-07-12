"use client";

import { useState } from "react";
import { SwipeCard } from "./SwipeCard";
import { swipe } from "@/lib/actions";
import { Heart, X } from "lucide-react";

export function UserFeedClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [currentIndex, setCurrentIndex] = useState(users.length - 1);

  const handleSwipe = async (direction: "left" | "right") => {
    if (currentIndex < 0) return;
    
    const user = users[currentIndex];
    const type = direction === "right" ? "like" : "pass";
    
    await swipe(user.id, type);
    
    setCurrentIndex((prev) => prev - 1);
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
            onSwipe={handleSwipe}
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
            onClick={(e) => {
              e.preventDefault(),
              handleSwipe("left")}}
            className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-red-500 hover:scale-110 transition-transform active:scale-95 border border-gray-100"
          >
            <X className="w-9 h-9" />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault(),
              handleSwipe("right")}}
            className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-green-500 hover:scale-110 transition-transform active:scale-95 border border-gray-100"
          >
            <Heart className="w-9 h-9 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
}