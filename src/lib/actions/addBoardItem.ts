"use server";

import { db } from "@/db";
import { events, eventBoardItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eventEmitter } from "@/lib/events-bus";
import { eq } from "drizzle-orm";
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

  eventEmitter.emit(`board:${eventId}`, newItem);

  revalidatePath(`/events/${eventId}/board`);

  return newItem;
}

export { addBoardItem };