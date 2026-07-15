"use server";

import { db } from "@/db";
import { 
  swipes, 
  chats, 
  chatParticipants, 
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function swipe(toUserId: string, type: "like" | "pass") {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

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
      const existingChat = await db.query.chats.findFirst({
        where: eq(chats.type, "direct"),
      });

      const isAlreadyConnected = await db.query.chatParticipants.findFirst({
        where: and(
          eq(chatParticipants.userId, session.id),
        )
      });

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
}