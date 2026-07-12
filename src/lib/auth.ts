import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSession() {
  const sessionCookie = (await cookies()).get("session_id");
  if (!sessionCookie) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, sessionCookie.value),
  });

  return user;
}

export async function login(userId: string) {
  (await cookies()).set("session_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

export async function logout() {
  (await cookies()).delete("session_id");
}
