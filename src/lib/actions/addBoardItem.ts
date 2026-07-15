"use server";

import { db } from "@/db";
import { 
  events, 
  eventBoardItems 
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
