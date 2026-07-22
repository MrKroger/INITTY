// src/app/api/sse/route.ts
import { NextRequest } from "next/server";
import { eventEmitter } from "@/lib/events-bus";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const userChannel = `user:${session.id}`;

  const handleUserEvent = (data: any) => {
    const formattedData = `data: ${JSON.stringify(data)}\n\n`;
    writer.write(encoder.encode(formattedData));
  };

  eventEmitter.on(userChannel, handleUserEvent);

  req.signal.addEventListener("abort", () => {
    eventEmitter.off(userChannel, handleUserEvent);
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