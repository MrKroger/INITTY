"use client";

import { useState } from "react";
import { ArrowLeft, Users, X } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";

interface Participant {
  id: string;
  name: string;
  avatar?: { key: string; bucket: string } | null;
}

interface ChatHeaderProps {
  type: "direct" | "group";
  title: string;
  avatar?: { key: string; bucket: string } | null;
  partnerId?: string;
  description?: string;
  participants?: Participant[];
}

export function ChatHeader({
  type,
  title,
  avatar,
  partnerId,
  description,
  participants = [],
}: ChatHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleHeaderClick = () => {
    if (type === "direct" && partnerId) {
      window.location.href = `/profile/${partnerId}`;
    } else if (type === "group") {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <header className="px-4 py-3 bg-white border-b flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 w-full">
          <Link
            href="/chats"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </Link>

          <button
            onClick={handleHeaderClick}
            className="flex items-center gap-3 flex-1 text-left hover:bg-gray-50 p-1.5 rounded-2xl transition-colors cursor-pointer overflow-hidden"
          >
            {type === "direct" ? (
              <UserAvatar
                avatar={avatar}
                userId={partnerId || "fallback"}
                userName={title}
                className="w-10 h-10 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-sm text-gray-900 truncate">{title}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {type === "direct" ? "Перейти в профиль" : `${participants.length} участников`}
              </p>
            </div>
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[80vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-bold text-lg text-gray-900">{title}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {description && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">О событии</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">
                Участники ({participants.length})
              </h4>
              <div className="space-y-3">
                {participants.map((p) => (
                  <Link
                    key={p.id}
                    href={`/profile/${p.id}`}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <UserAvatar
                      avatar={p.avatar}
                      userId={p.id}
                      userName={p.name}
                      className="w-9 h-9"
                    />
                    <span className="font-bold text-sm text-gray-800">{p.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}