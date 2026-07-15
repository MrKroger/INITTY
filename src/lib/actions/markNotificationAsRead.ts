"use server";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(notificationId: string) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Ошибка при обновлении статуса уведомления в БД:", error);
    throw new Error("Failed to mark notification as read");
  }
}