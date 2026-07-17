"use client";

import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Heart, X, Info } from "lucide-react";
import { type FeedUser } from "@/app/(main)/page"; 
import { UserAvatar } from "@/components/UserAvatar";

interface SwipeCardProps {
  user: FeedUser;
  onSwipe: (direction: "left" | "right") => void;
  zIndex?: number;
}

export function SwipeCard({ user, onSwipe, zIndex }: SwipeCardProps) {
  const [exitX, setExitX] = useState<number>(0);
  const [showBio, setShowBio] = useState(false);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipe("right");
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipe("left");
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex }}
      drag={showBio ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
    >
      <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        <UserAvatar 
          avatar={user.avatar} 
          userId={user.id} 
          userName={user.name} 
          className="w-full h-full object-cover pointer-events-none"
          withBorder={false}
          roundedClass="rounded-none"
        />
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-2 rounded-xl rotate-[-20deg] pointer-events-none z-20">
          ЛАЙК
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded-xl rotate-[20deg] pointer-events-none z-20">
          ПРОПУСТИТЬ
        </motion.div>

        <AnimatePresence>
          {showBio && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 h-1/3 bg-black/70 backdrop-blur-lg z-30 p-6 text-white overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-pink-400">О себе</h3>
                <button 
                  onClick={() => setShowBio(false)}
                  className="text-[10px] bg-white/20 px-2 py-1 rounded-md uppercase font-bold"
                >
                  Закрыть
                </button>
              </div>
              <p className="text-sm leading-relaxed opacity-90 italic">
                {user.bio || "Пользователь не оставил описания."}
              </p>

              {user.hobbies && user.hobbies.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                  {user.hobbies.map((hobby, index) => (
                    <span key={index} className="text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-md">
                      #{hobby}
                    </span>
                  ))}
                </div>
              )}
              
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none z-20">
          {user.isLiker && (
            <div className="mb-2 inline-flex items-center gap-1.5 bg-pink-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
              <Heart className="w-3 h-3 fill-current" />
              Вы нравитесь!
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-2">
              <h2 className="text-3xl font-bold truncate">{user.name}</h2>
              <p className="text-sm opacity-90 truncate">
                {user.university || "ВУЗ не указан"} • {user.faculty || "Факультет не указан"}
              </p>
  
              {user.hobbies && user.hobbies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {user.hobbies.slice(0, 2).map((hobby, index) => (
                    <span key={index} className="text-[10px] font-semibold bg-pink-500/30 text-pink-200 backdrop-blur-xs px-2 py-0.5 rounded-md border border-pink-500/20">
                      #{hobby}
                    </span>
                  ))}
                  {user.hobbies.length > 2 && (
                    <span className="text-[10px] text-gray-300 self-center ml-1">...</span>
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowBio(!showBio);
              }}
              className="p-3 bg-white/20 backdrop-blur-md rounded-full pointer-events-auto hover:bg-white/40 transition-colors shadow-lg active:scale-90"
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}