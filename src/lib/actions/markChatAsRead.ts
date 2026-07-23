"use server";

import { db } from "@/db";
import { chatParticipants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markChatAsRead(chatId: string) {
  const session = await getSession();
  if (!session) return;

  await db
    .update(chatParticipants)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(chatParticipants.chatId, chatId),
        eq(chatParticipants.userId, session.id)
      )
    );

}