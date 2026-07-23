import { db } from "@/db";
import { users, swipes } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { UserAvatar } from "@/components/UserAvatar";
import { LikeButton } from "@/components/profile/LikeButton";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: targetUserId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  // Получаем профиль пользователя
  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
    with: { avatar: true },
  });

  if (!targetUser) notFound();

  const isMyOwnProfile = session.id === targetUserId;

  // Проверяем, ставили ли мы лайк
  let isLiked = false;
  if (!isMyOwnProfile) {
    const existingSwipe = await db.query.swipes.findFirst({
      where: and(
        eq(swipes.fromUserId, session.id),
        eq(swipes.toUserId, targetUserId)
      ),
    });
    isLiked = !!existingSwipe;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b flex items-center gap-3 sticky top-0 z-10">
        <Link href="/chats" className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-gray-900 text-base">Профиль пользователя</h1>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center text-center">
          <UserAvatar
            avatar={targetUser.avatar}
            userId={targetUser.id}
            userName={targetUser.name}
            className="w-28 h-28 mb-4"
            withBorder
          />
          <h2 className="text-xl font-bold text-gray-900">{targetUser.name}</h2>
          
          {(targetUser.university || targetUser.faculty) && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <GraduationCap size={14} />
              {targetUser.university} {targetUser.faculty && `• ${targetUser.faculty}`}
            </p>
          )}
        </div>

        {targetUser.hobbies && targetUser.hobbies.length > 0 && (
          <div className="bg-white p-5 rounded-3xl shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Увлечения</h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {targetUser.hobbies.map((hobby, idx) => (
                <span
                  key={idx}
                  className="bg-pink-50 text-pink-600 text-xs font-semibold px-3 py-1.5 rounded-xl"
                >
                  #{hobby}
                </span>
              ))}
            </div>
          </div>
        )}

        {targetUser.bio && (
          <div className="bg-white p-5 rounded-3xl shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">О себе</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{targetUser.bio}</p>
          </div>
        )}

        {!isMyOwnProfile && (
          <div className="pt-2">
            <LikeButton targetUserId={targetUser.id} initialIsLiked={isLiked} />
          </div>
        )}
      </main>
    </div>
  );
}