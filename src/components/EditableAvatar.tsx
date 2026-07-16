"use client"; // Обязательно! Это клиентский интерактивный компонент

import React, { useState } from "react";
import AvatarUploadModal from "./AvatarUploadModal";
import { UserAvatar } from "@/components/UserAvatar";

interface EditableAvatarProps {
  userId: string;
  initialAvatar: {
    bucket: string;
    key: string;
  } | null;
}

export default function EditableAvatar({ userId, initialAvatar }: EditableAvatarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialUrl = initialAvatar
    ? `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL}/${initialAvatar.bucket}/${initialAvatar.key}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

  const [avatarUrl, setAvatarUrl] = useState<string>(initialUrl);

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative group w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-250 cursor-pointer transition-transform hover:scale-[1.02]"
      >
        <UserAvatar 
          avatar={initialAvatar}
          userId={userId} 
          userName="Мой профиль" 
          className="w-full h-full object-cover"
          withBorder={false}
        />
        
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-white text-xs font-semibold tracking-wide">Изменить</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="mt-3 text-xs font-semibold text-violet-600 hover:text-violet-700 transition"
      >
        Сменить фото
      </button>

      <AvatarUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        onUploadSuccess={(newUrl) => {
          setAvatarUrl(newUrl);
        }}
      />
    </div>
  );
}