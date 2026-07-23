import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { decryptText } from "@/lib/crypto";
import { eq, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatClient } from "@/components/chat/ChatClient";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: chatId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
    with: {
      participants: {
        with: {
          user: {
            with: { avatar: true },
          },
        },
      },
      event: true,
    },
  });

  if (!chat) notFound();

  const rawMessages = await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    orderBy: [asc(messages.createdAt)],
  });

  const decryptedMessages = rawMessages.map((msg) => ({
    ...msg,
    content: msg.content ? decryptText(msg.content) : null,
  }));

  let title = "";
  let avatar = null;
  let partnerId: string | undefined = undefined;
  let participantsList: any[] = [];

  if (chat.type === "direct") {
    const partner = chat.participants.find((p) => p.userId !== session.id)?.user;
    title = partner?.name || "Собеседник";
    avatar = partner?.avatar;
    partnerId = partner?.id;
  } else {
    title = chat.event?.title || "Чат события";
    participantsList = chat.participants.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      avatar: p.user.avatar,
    }));
  }

  return (
    <div className="fixed inset-0 z-50 max-w-md mx-auto h-[100dvh] bg-white flex flex-col overflow-hidden">
      <div className="shrink-0">
        <ChatHeader
          type={chat.type as "direct" | "group"}
          title={title}
          avatar={avatar}
          partnerId={partnerId}
          description={chat.event?.description || undefined}
          participants={participantsList}
        />
      </div>

      <ChatClient
        chatId={chatId}
        currentUserId={session.id}
        initialMessages={decryptedMessages}
      />
    </div>
  );
}