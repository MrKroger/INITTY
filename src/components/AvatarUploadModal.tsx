"use client";

import React, { useState, useRef } from "react";
import { uploadAvatarAction } from "@/lib/actions/upload";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUploadSuccess: (newAvatarUrl: string) => void;
}

export default function AvatarUploadModal({
  isOpen,
  onClose,
  userId,
  onUploadSuccess,
}: AvatarUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Обработка выбора файла через проводник
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    processFile(selectedFile);
  };

  // Валидация и создание превью
  const processFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    setError(null);

    // Проверка формата
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Разрешены только форматы JPEG, PNG и WebP");
      return;
    }

    // Проверка размера (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Размер файла не должен превышать 5 MB");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // Обработка Drag-and-Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    processFile(droppedFile);
  };

  // Отправка файла на сервер
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Вызываем наш серверный экшен
      const response = await uploadAvatarAction(userId, formData);

      if (response.success && response.avatarUrl) {
        onUploadSuccess(response.avatarUrl);
        handleClose();
      } else {
        setError(response.error || "Произошла ошибка при загрузке");
      }
    } catch (err) {
      setError("Не удалось загрузить изображение. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  // Очистка состояния при закрытии
  const handleClose = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Заголовок */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Обновить аватар
          </h3>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Форма загрузки */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* Зона Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/20"
                : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {previewUrl ? (
              <div className="flex flex-col items-center space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Превью"
                  className="h-28 w-28 rounded-full object-cover border-4 border-violet-100 dark:border-violet-900/50"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Нажмите, чтобы заменить файл
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <span className="text-3xl">🖼️</span>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Перетащите картинку сюда или нажмите для выбора
                </p>
                <p className="text-xs text-zinc-400">
                  Поддерживаются JPEG, PNG, WebP до 5MB
                </p>
              </div>
            )}
          </div>

          {/* Отображение ошибки */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900/30">
              ⚠️ {error}
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-850">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!file || isLoading}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-600/50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  <span>Загрузка...</span>
                </>
              ) : (
                <span>Сохранить</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}