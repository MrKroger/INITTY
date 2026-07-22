"use server";

import { db } from "@/db";
import { events, eventBoardItems, eventApplications } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eventEmitter } from "@/lib/events-bus";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function addBoardItem(eventId: string, content: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event || event.creatorId !== session.id) {
    throw new Error("Только создатель может писать на доске");
  }

  const [newItem] = await db
    .insert(eventBoardItems)
    .values({
      eventId,
      creatorId: session.id,
      content,
    })
    .returning();

  const applications = await db.query.eventApplications.findMany({
    where: and(
      eq(eventApplications.eventId, eventId),
      eq(eventApplications.status, "approved")
    ),
    columns: {
      userId: true,
    },
  });

  const recipientUserIds = new Set([
    ...applications.map((app) => app.userId),
    event.creatorId,
  ]);

  const payload = {
    type: "NEW_BOARD_ITEM",
    eventId,
    creatorId: session.id,
    item: newItem,
  };

  recipientUserIds.forEach((userId) => {
    eventEmitter.emit(`user:${userId}`, payload);
  });

  revalidatePath(`/events/${eventId}/board`);

  return newItem;
}

export { addBoardItem };