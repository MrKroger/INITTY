"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { login, getLockoutTimeLeft, handleLoginAttempt } from "@/lib/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

type LoginResponse = {
  success: boolean;
  error?: string;
};

async function loginAction(formData: FormData): Promise<LoginResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Заполните все поля" };
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return { success: false, error: "Неверный email или пароль" };
    }

    const minutesLeft = getLockoutTimeLeft(user);
    if (minutesLeft !== null) {
      return { 
        success: false, 
        error: `Аккаунт временно заблокирован. Попробуйте через ${minutesLeft} мин.` 
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    const { isLockedOut, remainingAttempts } = await handleLoginAttempt(user, isPasswordValid);

    if (!isPasswordValid) {
      if (isLockedOut) {
        return { 
          success: false, 
          error: "Слишком много неудачных попыток. Доступ заблокирован на 15 минут." 
        };
      } else {
        return { 
          success: false, 
          error: `Неверный email или пароль. Осталось попыток: ${remainingAttempts}` 
        };
      }
    }

    await login(user.id);

    return { success: true };
  } catch (error) {
    console.error("Ошибка при авторизации:", error);
    return { success: false, error: "Что-то пошло не так. Попробуйте позже." };
  }
}

export {
  type LoginResponse,
  loginAction
};