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
  
  console.log("--- [AUTH DEBUG] ---");
  console.log("1. Найдена кука session_id:", sessionCookie ? "ДА" : "НЕТ");
  
  if (!sessionCookie) {
    console.log("Выход: Куки нет");
    return null;
  }

  console.log("2. Сырое значение куки:", sessionCookie.value.substring(0, 20) + "...");

  // Пробуем расшифровать
  const payload = await decrypt(sessionCookie.value);
  console.log("3. Результат расшифровки payload:", payload);

  if (!payload || !payload.userId) {
    console.log("Выход: Не удалось расшифровать токен или userId пуст");
    return null;
  }

  console.log("4. Ищем пользователя в БД с ID:", payload.userId);

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    console.log("5. Пользователь найден в БД?:", user ? `ДА (${user.name})` : "НЕТ");
    return user;
  } catch (dbError) {
    console.error("ОШИБКА ПРИ ЗАПРОСЕ К БД в getSession:", dbError);
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
