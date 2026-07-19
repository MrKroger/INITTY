"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function updateProfileData(data: {
  university: string;
  faculty: string;
  isGraduated: boolean;
  course: number | null;
  hobbies: string[];
  bio: string;
}) {
  const session = await getSession();
  if (!session?.id) throw new Error("Unauthorized");

  if (!data.university.trim() || data.hobbies.length === 0) {
    throw new Error("Заполните обязательные поля");
  }

  await db.update(users)
    .set({
      university: data.university,
      faculty: data.isGraduated ? "Выпускник" : data.faculty,
      isGraduated: data.isGraduated,
      course: data.isGraduated ? null : data.course,
      hobbies: data.hobbies,
      bio: data.bio,
    })
    .where(eq(users.id, session.id));

  revalidatePath("/profile");
}

export{
  updateProfileData
}