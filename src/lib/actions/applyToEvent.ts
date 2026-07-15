"use server";

import { db } from "@/db";
import { 
  chats, 
  chatParticipants, 
  eventApplications, 
  events, 
  notifications, 
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function applyToEvent(eventId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) throw new Error("Событие не найдено");

  const existingApplication = await db.query.eventApplications.findFirst({
    where: and(
      eq(eventApplications.eventId, eventId),
      eq(eventApplications.userId, session.id)
    )
  });

  if (existingApplication) {
    if (existingApplication.status === "rejected") {
      await db.delete(eventApplications)
        .where(eq(eventApplications.id, existingApplication.id));
    } else {
      return { success: false, message: "Вы уже участник или ваша заявка на рассмотрении" };
    }
  }

  if (event.type === "open") {
    await db.insert(eventApplications).values({
      eventId,
      userId: session.id,
      status: "approved",
    });

    let chat = await db.query.chats.findFirst({
      where: eq(chats.eventId, eventId),
    });

    if (!chat) {
      [chat] = await db.insert(chats).values({
        type: "group",
        eventId: eventId,
      }).returning();
      
      const isCreatorInChat = await db.query.chatParticipants.findFirst({
        where: and(
          eq(chatParticipants.chatId, chat.id),
          eq(chatParticipants.userId, event.creatorId)
        )
      });

      if (!isCreatorInChat) {
        await db.insert(chatParticipants).values({
          chatId: chat.id,
          userId: event.creatorId,
        });
      }
    }

    const isUserInChat = await db.query.chatParticipants.findFirst({
      where: and(
        eq(chatParticipants.chatId, chat.id),
        eq(chatParticipants.userId, session.id)
      )
    });

    if (!isUserInChat) {
      await db.insert(chatParticipants).values({
        chatId: chat.id,
        userId: session.id,
      });
    }

    await db.insert(notifications).values({
      userId: event.creatorId,
      fromUserId: session.id,
      eventId: eventId,
      type: "new_member",
    });

  } else {
    const [newApplication] = await db.insert(eventApplications).values({
      eventId,
      userId: session.id,
      status: "pending",
    }).returning();

    await db.insert(notifications).values({
      id: newApplication.id,
      userId: event.creatorId,
      fromUserId: session.id,
      eventId: eventId,
      type: "join_request",
    });
  }

  revalidatePath("/events");
  revalidatePath("/notifications"); 
  return { success: true };
}