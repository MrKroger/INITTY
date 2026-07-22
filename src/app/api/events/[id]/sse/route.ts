import { NextRequest } from "next/server";
import { eventEmitter } from "@/lib/events-bus";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { events, eventApplications } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Проверка существования события
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const isCreator = event.creatorId === session.id;

  if (!isCreator && event.type === "closed") {
    const application = await db.query.eventApplications.findFirst({
      where: and(
        eq(eventApplications.eventId, eventId),
        eq(eventApplications.userId, session.id),
        eq(eventApplications.status, "approved")
      ),
    });

    if (!application) {
      return new Response("Forbidden: У вас нет доступа к этой доске", { status: 403 });
    }
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const channelName = `board:${eventId}`;

  const handleNewAnnouncement = (announcement: any) => {
    const formattedData = `data: ${JSON.stringify(announcement)}\n\n`;
    writer.write(encoder.encode(formattedData));
  };

  eventEmitter.on(channelName, handleNewAnnouncement);

  req.signal.addEventListener("abort", () => {
    eventEmitter.off(channelName, handleNewAnnouncement);
    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}