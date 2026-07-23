"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { likeUser } from "@/lib/actions/likeUser";

export function LikeButton({
  targetUserId,
  initialIsLiked,
}: {
  targetUserId: string;
  initialIsLiked: boolean;
}) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (isLiked || loading) return;
    setLoading(true);

    try {
      await likeUser(targetUserId);
      setIsLiked(true);
    } catch (err) {
      console.error("Ошибка при постановке лайка:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLiked || loading}
      className={`w-full py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
        isLiked
          ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
          : "bg-pink-500 text-white hover:bg-pink-600 active:scale-95"
      }`}
    >
      <Heart size={20} className={isLiked ? "fill-gray-400 stroke-gray-400" : "fill-white"} />
      {isLiked ? "Заявка отправлена" : "Поставить Like"}
    </button>
  );
}