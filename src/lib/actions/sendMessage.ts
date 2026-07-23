"use server";

import { db } from "@/db";
import { messages, chatParticipants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eventEmitter } from "@/lib/events-bus";
import { encryptText } from "@/lib/crypto";
import { eq } from "drizzle-orm";

export async function sendMessage(chatId: string, content?: string, imageUrl?: string) {
  const session = await getSession();
  if (!session) throw new Error("Неавторизован");

  const trimmedContent = content?.trim();
  if (!trimmedContent && !imageUrl) {
    throw new Error("Сообщение не может быть пустым");
  }

  const encryptedContent = trimmedContent ? encryptText(trimmedContent) : null;

  const [newMessage] = await db
    .insert(messages)
    .values({
      chatId,
      senderId: session.id,
      content: encryptedContent,
      imageUrl: imageUrl || null,
    })
    .returning();

  const participants = await db.query.chatParticipants.findMany({
    where: eq(chatParticipants.chatId, chatId),
    columns: { userId: true },
  });

  const payload = {
    type: "NEW_CHAT_MESSAGE",
    chatId,
    message: {
      ...newMessage,
      content: trimmedContent || null,
      sender: {
        id: session.id,
        name: session.name,
      },
    },
  };

  participants.forEach((p) => {
    eventEmitter.emit(`user:${p.userId}`, payload);
  });

  return newMessage;
}