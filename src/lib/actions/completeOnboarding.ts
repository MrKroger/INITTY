"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function completeOnboarding(formData: FormData) {
  const session = await getSession();
  if (!session?.id) throw new Error("Unauthorized");

  const university = formData.get("university") as string;
  const isGraduated = formData.get("isGraduated") === "true";
  const faculty = isGraduated ? "Выпускник" : (formData.get("faculty") as string);
  const courseRaw = formData.get("course");
  const course = isGraduated ? null : (courseRaw ? parseInt(courseRaw as string, 10) : null);
  const hobbiesRaw = formData.get("hobbies") as string;

  if (!university?.trim() || (!isGraduated && !faculty?.trim()) || !hobbiesRaw) {
    throw new Error("Заполните все обязательные поля");
  }

  const hobbies = JSON.parse(hobbiesRaw) as string[];
  if (hobbies.length === 0) {
    throw new Error("Добавьте хотя бы одно увлечение");
  }

  await db.update(users)
    .set({
      university,
      faculty,
      isGraduated,
      course,
      hobbies,
      isOnboarded: true,
    })
    .where(eq(users.id, session.id));

  revalidatePath("/");
  redirect("/");
}

export{
  completeOnboarding
}