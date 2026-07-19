import { db } from "@/db";
import { users, swipes, type User } from "@/db/schema";
import { getSession, type UserWithAvatar } from "@/lib/auth";
import { notInArray, eq, and, sql, inArray } from "drizzle-orm";
import { UserFeedClient } from "@/components/UserFeedClient";

function areFacultiesAdjacent(f1: string = "", f2: string = ""): boolean {
  const fac1 = f1.toLowerCase();
  const fac2 = f2.toLowerCase();
  
  if (fac1 === fac2) return true;

  const tech = ["ивт", "физ", "мат", "прог", "ит", "it", "информ", "cs", "кибер", "техн"];
  const creative = ["дизайн", "диз", "арт", "график", "медиа", "худ", "архит"];
  const hum = ["гум", "псих", "лингв", "филол", "соц", "журн", "реклам"];

  const check = (keywords: string[]) => 
    keywords.some(k => fac1.includes(k)) && keywords.some(k => fac2.includes(k));

  return check(tech) || check(creative) || check(hum);
}

interface FeedUser extends UserWithAvatar {
  score?: number;
  isLiker?: boolean;
}

async function FeedPage() {
  const session = await getSession();
  if (!session) return null;

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, session.id),
    with: {avatar: true}
  });
  if (!currentUser) return null;

  const twentyDaysAgo = new Date();
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

  const usersWhoLikedUs = await db.query.swipes.findMany({
    where: and(eq(swipes.toUserId, session.id), eq(swipes.type, "like")),
    columns: { fromUserId: true }
  });
  const likerIds = usersWhoLikedUs.map(s => s.fromUserId);

  const myRecentSwipes = await db.query.swipes.findMany({
    where: and(
      eq(swipes.fromUserId, session.id),
      sql`${swipes.createdAt} > ${twentyDaysAgo}`
    ),
    columns: { toUserId: true }
  });
  const excludedIds = [...myRecentSwipes.map(s => s.toUserId), session.id];

  const likersToDisplay = likerIds.length > 0 
    ? await db.query.users.findMany({
        where: and(inArray(users.id, likerIds), notInArray(users.id, excludedIds)),
        with: {avatar: true}
      })
    : [];

  const finalExcluded = [...excludedIds, ...likersToDisplay.map(u => u.id)];
  const commonUsers = await db.query.users.findMany({
    where: notInArray(users.id, finalExcluded),
    limit: 60,
    with: {avatar: true}
  });

  const sortedCommonUsers = commonUsers
    .map((targetUser: UserWithAvatar) => {
      let score = 0;

      if (targetUser.track && currentUser.track && targetUser.track === currentUser.track) {
        score += 30;
      } else if (areFacultiesAdjacent(targetUser.faculty || "", currentUser.faculty || "")) {
        score += 15; 
      }

      if (targetUser.hobbies && currentUser.hobbies) {
        const commonHobbies = targetUser.hobbies.filter(h => currentUser.hobbies?.includes(h));
        if (commonHobbies.length > 0) {
          score += Math.min(commonHobbies.length * 8, 25);
        }
      }

      if (targetUser.faculty && currentUser.faculty) {
        if (targetUser.faculty === currentUser.faculty) {
          score += 20;
        } else if (areFacultiesAdjacent(targetUser.faculty, currentUser.faculty)) {
          score += 12;
        }
      }

      if (targetUser.purpose && currentUser.purpose && targetUser.purpose === currentUser.purpose) {
        score += 15;
      }

      if (targetUser.university && currentUser.university && targetUser.university === currentUser.university) {
        score += 10;
      }

      return { ...targetUser, score };
    }).sort((a, b) => a.score - b.score);

  const potentialMatches = [
    ...sortedCommonUsers.map(u => ({ ...u, isLiker: false })),
    ...likersToDisplay.map(u => ({ ...u, isLiker: true }))
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-6 py-4 border-b bg-white flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-pink-500 italic">UNITY</h1>
      </header>
      <div className="relative flex-1 p-4 flex justify-center items-center">
        {potentialMatches.length > 0 ? (
          <UserFeedClient initialUsers={potentialMatches} />
        ) : (
          <div className="text-center">
            <h3 className="font-bold">Пока никого нет</h3>
            <p className="text-gray-500 text-sm mt-2">Попробуйте зайти позже</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { type FeedUser };
export default FeedPage;