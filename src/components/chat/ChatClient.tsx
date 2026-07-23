"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Mail, X } from "lucide-react";
import { useSSE } from "@/components/providers/SSEProvider";
import { sendMessage } from "@/lib/actions/sendMessage";
import { markChatAsRead } from "@/lib/actions/markChatAsRead";

interface Message {
  id: string;
  senderId: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: Date | string;
}

interface ChatClientProps {
  chatId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export function ChatClient({ chatId, currentUserId, initialMessages }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { lastMessage, clearUnreadChats } = useSSE();
  const router = useRouter();

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
  markChatAsRead(chatId);
  clearUnreadChats();
  scrollToBottom(false);
}, [chatId]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  useEffect(() => {
    if (!lastMessage) return;

    if (
      lastMessage.type === "NEW_CHAT_MESSAGE" &&
      lastMessage.chatId === chatId &&
      lastMessage.message
    ) {
      const incomingMsg = lastMessage.message;
      setMessages((prev) => {
        if (prev.some((m) => m.id === incomingMsg.id)) return prev;
        return [...prev, incomingMsg];
      });

      markChatAsRead(chatId);
    }
  }, [lastMessage, chatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isSending) return;

    const textToSend = inputText;
    const imageToSend = selectedImage;

    setInputText("");
    setSelectedImage(null);
    setIsSending(true);

    try {
      await sendMessage(chatId, textToSend, imageToSend || undefined);
      await markChatAsRead(chatId);
    } catch (error) {
      console.error("Ошибка отправки:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f4f5f7] relative overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => {
          const isMy = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMy ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl relative text-sm shadow-sm ${
                  isMy
                    ? "bg-pink-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Вложение"
                    className="rounded-xl mb-2 max-h-60 w-full object-cover"
                  />
                )}
                {msg.content && <p className="leading-relaxed break-words">{msg.content}</p>}

                <span
                  className={`text-[9px] block text-right mt-1 font-bold ${
                    isMy ? "text-pink-100" : "text-gray-400"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {selectedImage && (
        <div className="px-4 py-2 bg-white border-t flex items-center gap-3 shrink-0">
          <div className="relative">
            <img
              src={selectedImage}
              className="w-12 h-12 object-cover rounded-lg border"
              alt="Превью"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow"
            >
              <X size={12} />
            </button>
          </div>
          <span className="text-xs text-gray-500">Фото прикреплено</span>
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t flex items-center gap-2 shrink-0 z-10"
      >
        <label className="p-2.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full cursor-pointer transition-colors">
          <Paperclip size={20} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </label>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Написать сообщение..."
          className="flex-1 bg-gray-100 text-sm text-gray-800 px-4 py-2.5 rounded-2xl outline-none focus:ring-1 ring-pink-500 transition-all"
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && !selectedImage) || isSending}
          className="p-2.5 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-40 transition-all active:scale-95 shadow-md"
        >
          <Mail size={18} />
        </button>
      </form>
    </div>
  );
}