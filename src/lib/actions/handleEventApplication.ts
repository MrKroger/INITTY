"use server";

import { db } from "@/db";
import { 
  chats, 
  chatParticipants, 
  eventApplications, 
  notifications, 
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function handleEventApplication(applicationId: string, status: "approved" | "rejected") {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const application = await db.query.eventApplications.findFirst({
    where: eq(eventApplications.id, applicationId),
    with: { event: true }
  });

  if (!application || application.event.creatorId !== session.id) {
    throw new Error("У вас нет прав для этого действия");
  }

  await db.update(eventApplications)
    .set({ status })
    .where(eq(eventApplications.id, applicationId));
  
  await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, applicationId));

  if (status === "approved") {
    let chat = await db.query.chats.findFirst({
      where: eq(chats.eventId, application.eventId),
    });

    if (!chat) {
      [chat] = await db.insert(chats).values({
        type: "group",
        eventId: application.eventId,
      }).returning();
      
      await db.insert(chatParticipants).values({
        chatId: chat.id,
        userId: application.event.creatorId,
      });
    }

    const existingParticipant = await db.query.chatParticipants.findFirst({
      where: and(
        eq(chatParticipants.chatId, chat.id),
        eq(chatParticipants.userId, application.userId)
      )
    });

    if (!existingParticipant) {
      await db.insert(chatParticipants).values({
        chatId: chat.id,
        userId: application.userId,
      });
    }

    await db.insert(notifications).values({
      userId: application.userId,
      fromUserId: session.id,
      eventId: application.eventId,
      type: "join_accepted",
    });
  }

  revalidatePath("/profile");
  revalidatePath("/notifications");
}

export{
  handleEventApplication
}