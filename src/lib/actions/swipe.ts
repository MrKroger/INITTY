"use server";

import { db } from "@/db";
import { 
  swipes, 
  chats, 
  chatParticipants, 
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MAX_SWIPES_PER_MINUTE = 40;

export async function swipe(toUserId: string, type: "like" | "pass") {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(swipes)
    .where(
      and(
        eq(swipes.fromUserId, session.id),
        sql`${swipes.createdAt} > ${oneMinuteAgo}`
      )
    );

  const swipeCount = Number(result?.count || 0);

  if (swipeCount >= MAX_SWIPES_PER_MINUTE) {
    throw new Error("Вы свайпаете слишком быстро! Пожалуйста, подождите немного.");
  }

  // --- ПРЕДОТВРАЩЕНИЕ ДУБЛИКАТОВ СВАЙПОВ ---
  // Проверяем, не свайпали ли мы этого пользователя уже ранее
  const existingSwipe = await db.query.swipes.findFirst({
    where: and(
      eq(swipes.fromUserId, session.id),
      eq(swipes.toUserId, toUserId)
    )
  });

  if (existingSwipe) {
    return { match: false, error: "Вы уже оценили этого пользователя" };
  }
  
  await db.insert(swipes).values({
    fromUserId: session.id,
    toUserId,
    type,
  });

  if (type === "like") {
    const mutualLike = await db.query.swipes.findFirst({
      where: and(
        eq(swipes.fromUserId, toUserId),
        eq(swipes.toUserId, session.id),
        eq(swipes.type, "like")
      ),
    });

    if (mutualLike) {
      // Ищем существующий диалог между этими двумя пользователями
      const allUserChats = await db.query.chatParticipants.findMany({
        where: eq(chatParticipants.userId, session.id),
      });
  
      const chatIds = allUserChats.map(c => c.chatId);
  
      let existingDirectChat = null;
      if (chatIds.length > 0) {
        existingDirectChat = await db.query.chatParticipants.findFirst({
          where: and(
            inArray(chatParticipants.chatId, chatIds),
            eq(chatParticipants.userId, toUserId)
          )
        });
      }

      if (existingDirectChat) {
        return { match: true };
      }

      // Если чата нет — создаем новый
      const [newChat] = await db.insert(chats).values({
        type: "direct",
      }).returning();

      await db.insert(chatParticipants).values([
        { chatId: newChat.id, userId: session.id },
        { chatId: newChat.id, userId: toUserId },
      ]);
      
      return { match: true };
    }

    revalidatePath("/");
    return { match: false };
    }

    return { match: false };
}