"use server";

import { db } from "@/db";
import { swipes, notifications } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eventEmitter } from "@/lib/events-bus";
import { eq, and } from "drizzle-orm";

export async function likeUser(toUserId: string) {
  const session = await getSession();
  if (!session) throw new Error("Неавторизован");

  if (session.id === toUserId) {
    throw new Error("Нельзя поставить лайк самому себе");
  }

  const existingSwipe = await db.query.swipes.findFirst({
    where: and(
      eq(swipes.fromUserId, session.id),
      eq(swipes.toUserId, toUserId)
    ),
  });

  if (existingSwipe) {
    return { success: true, alreadyLiked: true };
  }

  await db.insert(swipes).values({
    fromUserId: session.id,
    toUserId: toUserId,
    type: "like",
  });

  const [notification] = await db.insert(notifications).values({
    userId: toUserId,
    fromUserId: session.id,
    type: "LIKE",
    isRead: false,
  }).returning();

  eventEmitter.emit(`user:${toUserId}`, {
    type: "NEW_NOTIFICATION",
    notification: {
      ...notification,
      fromUser: {
        id: session.id,
        name: session.name,
        avatar: session.avatar,
      },
    },
  });

  return { success: true, alreadyLiked: false };
}