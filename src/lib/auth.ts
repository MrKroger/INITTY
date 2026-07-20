import { cookies } from "next/headers";
import { db } from "@/db";
import { users, type User, type Upload } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

type UserWithAvatar = User & {
  avatar: Upload | null;
};

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-fallback-secret-key-make-sure-to-set-env"
);

async function encrypt(payload: { userId: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

async function decrypt(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as { userId: string };
  } catch (error) {
    return null;
  }
}

async function getSession(): Promise<UserWithAvatar | null> {
  const sessionCookie = (await cookies()).get("session_id");
    
  if (!sessionCookie) {
    console.log("Выход: Куки нет");
    return null;
  }

  const payload = await decrypt(sessionCookie.value);

  if (!payload || !payload.userId) {
    return null;
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      with: {
        avatar: true,
      },
    });

    return (user as UserWithAvatar) || null;
  } catch (dbError) {
    console.error("Ошибка при получении сессии из БД:", dbError);
    return null;
  }
}

async function login(userId: string) {
  const token = await encrypt({ userId });

  (await cookies()).set("session_id", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });
}

async function logout() {
  (await cookies()).delete("session_id");
}

function getLockoutTimeLeft(user: Pick<User, "lockoutUntil">): number | null {
  if (!user.lockoutUntil) return null;

  const now = new Date();
  const lockoutTime = new Date(user.lockoutUntil);

  if (lockoutTime > now) {
    const msLeft = lockoutTime.getTime() - now.getTime();
    return Math.ceil(msLeft / 1000 / 60);
  }

  return null;
}

async function handleLoginAttempt(
  user: Pick<User, "id" | "failedAttempts">,
  isSuccess: boolean
): Promise<{ isLockedOut: boolean; remainingAttempts: number }> {
  if (isSuccess) {
    await db
      .update(users)
      .set({
        failedAttempts: 0,
        lockoutUntil: null,
      })
      .where(eq(users.id, user.id));

    return { isLockedOut: false, remainingAttempts: MAX_ATTEMPTS };
  } else {
    const nextAttempts = user.failedAttempts + 1;
    const isLockedOut = nextAttempts >= MAX_ATTEMPTS;
    const lockoutUntil = isLockedOut ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

    await db
      .update(users)
      .set({
        failedAttempts: sql`${users.failedAttempts} + 1`,
        lockoutUntil: lockoutUntil,
      })
      .where(eq(users.id, user.id));

    return {
      isLockedOut,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - nextAttempts),
    };
  }
}

export {
  type UserWithAvatar,
  getSession,
  login,
  logout,
  getLockoutTimeLeft,
  handleLoginAttempt
};