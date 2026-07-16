"use client"; // Обязательно! Это клиентский интерактивный компонент

import React, { useState } from "react";
import AvatarUploadModal from "./AvatarUploadModal";

interface EditableAvatarProps {
  userId: string;
  initialAvatar: {
    bucket: string;
    key: string;
  } | null;
}

export default function EditableAvatar({ userId, initialAvatar }: EditableAvatarProps) {
  // 1. Управляем открытием модалки
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Строим начальный URL аватара из MinIO, если он есть в БД.
  // Если нет — показываем дефолтный генератор аватарок DiceBear как у вас
  const initialUrl = initialAvatar
    ? `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL}/${initialAvatar.bucket}/${initialAvatar.key}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

  const [avatarUrl, setAvatarUrl] = useState<string>(initialUrl);

  return (
    <div className="flex flex-col items-center">
      {/* Контейнер аватара с эффектом наведения */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative group w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-250 cursor-pointer transition-transform hover:scale-[1.02]"
      >
        <img 
          src={avatarUrl} 
          className="w-full h-full object-cover" 
          alt="Avatar" 
        />
        
        {/* Затемнение и надпись при наведении */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-white text-xs font-semibold tracking-wide">Изменить</span>
        </div>
      </div>

      {/* Кнопка под аватаркой для большего удобства */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="mt-3 text-xs font-semibold text-violet-600 hover:text-violet-700 transition"
      >
        Сменить фото
      </button>

      {/* Наше модальное окно */}
      <AvatarUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        onUploadSuccess={(newUrl) => {
          setAvatarUrl(newUrl); // Мгновенно меняем картинку на новую
        }}
      />
    </div>
  );
}