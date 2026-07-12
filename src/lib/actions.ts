"use server";

import { db } from "@/db";
import { 
  swipes, 
  users, 
  chats, 
  chatParticipants, 
  eventApplications, 
  events, 
  notifications, 
  eventBoardItems 
} from "@/db/schema";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function completeOnboarding(formData: FormData) {
  const session = await getSession();
  if (!session?.id) throw new Error("Unauthorized");

  const university = formData.get("university") as string;
  const isGraduated = formData.get("isGraduated") === "true";
  const faculty = isGraduated ? "Выпускник" : (formData.get("faculty") as string);
  const courseRaw = formData.get("course");
  const course = isGraduated ? null : (courseRaw ? parseInt(courseRaw as string, 10) : null);
  const hobbiesRaw = formData.get("hobbies") as string;

  if (!university?.trim() || (!isGraduated && !faculty?.trim()) || !hobbiesRaw) {
    throw new Error("Заполните все обязательные поля");
  }

  const hobbies = JSON.parse(hobbiesRaw) as string[];
  if (hobbies.length === 0) {
    throw new Error("Добавьте хотя бы одно увлечение");
  }

  await db.update(users)
    .set({
      university,
      faculty,
      isGraduated,
      course,
      hobbies,
      isOnboarded: true,
    })
    .where(eq(users.id, session.id));

  revalidatePath("/");
  redirect("/");
}

export async function updateProfileData(data: {
  university: string;
  faculty: string;
  isGraduated: boolean;
  course: number | null;
  hobbies: string[];
  bio: string;
}) {
  const session = await getSession();
  if (!session?.id) throw new Error("Unauthorized");

  if (!data.university.trim() || data.hobbies.length === 0) {
    throw new Error("Заполните обязательные поля");
  }

  await db.update(users)
    .set({
      university: data.university,
      faculty: data.isGraduated ? "Выпускник" : data.faculty,
      isGraduated: data.isGraduated,
      course: data.isGraduated ? null : data.course,
      hobbies: data.hobbies,
      bio: data.bio,
    })
    .where(eq(users.id, session.id));

  revalidatePath("/profile");
}

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

export async function handleEventApplication(applicationId: string, status: "approved" | "rejected") {
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
}

export async function addBoardItem(eventId: string, content: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event || event.creatorId !== session.id) {
    throw new Error("Только создатель может писать на доске");
  }

  await db.insert(eventBoardItems).values({
    eventId,
    creatorId: session.id,
    content,
  });

  revalidatePath(`/events/${eventId}/board`);
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Ошибка при обновлении статуса уведомления в БД:", error);
    throw new Error("Failed to mark notification as read");
  }
}