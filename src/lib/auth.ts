import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";

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

export async function getSession() {
  const sessionCookie = (await cookies()).get("session_id");
    
  if (!sessionCookie) {
    console.log("Выход: Куки нет");
    return null;
  }

  // Пробуем расшифровать
  const payload = await decrypt(sessionCookie.value);

  if (!payload || !payload.userId) {
    return null;
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    return user;
  } catch (dbError) {
    return null;
  }
}

export async function login(userId: string) {
  const token = await encrypt({ userId });

  (await cookies()).set("session_id", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });
}

export async function logout() {
  (await cookies()).delete("session_id");
}
