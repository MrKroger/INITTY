"use server";

import { db } from "@/db";
import { chats, chatParticipants, notifications, swipes } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function handleLikeResponse(
  notificationId: string,
  fromUserId: string,
  action: "accept" | "decline"
) {
  const session = await getSession();
  if (!session) throw new Error("Неавторизован");

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));

  if (action === "accept") {
    const existingSwipe = await db.query.swipes.findFirst({
      where: and(
        eq(swipes.fromUserId, session.id),
        eq(swipes.toUserId, fromUserId)
      ),
    });

    if (!existingSwipe) {
      await db.insert(swipes).values({
        fromUserId: session.id,
        toUserId: fromUserId,
        type: "like",
      });
    }

    const userChats = await db.query.chatParticipants.findMany({
      where: eq(chatParticipants.userId, session.id),
      with: { chat: { with: { participants: true } } },
    });

    const existingDirectChat = userChats.find((cp) => {
      if (cp.chat.type !== "direct") return false;
      return cp.chat.participants.some((p) => p.userId === fromUserId);
    });

    if (!existingDirectChat) {
      const [newChat] = await db
        .insert(chats)
        .values({
          type: "direct",
        })
        .returning();

      await db.insert(chatParticipants).values([
        { chatId: newChat.id, userId: session.id },
        { chatId: newChat.id, userId: fromUserId },
      ]);
    }
  } else {
    await db.insert(swipes).values({
      fromUserId: session.id,
      toUserId: fromUserId,
      type: "pass",
    });
  }

  revalidatePath("/notifications");
  revalidatePath("/chats");

  return { success: true };
}