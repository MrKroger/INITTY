"use server";

import { db } from "@/db";
import { events } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    title?: string;
    description?: string;
    type?: string;
    tags?: string;
  };
};

async function createEvent(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "Вы должны быть авторизованы для создания события." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const type = (formData.get("type") as string)?.trim();
  const tagsRaw = (formData.get("tags") as string)?.trim();

  const fieldErrors: NonNullable<ActionState["fieldErrors"]> = {};

  if (!title) {
    fieldErrors.title = "Название события обязательно для заполнения.";
  } else if (title.length < 5) {
    fieldErrors.title = "Название должно быть не менее 5 символов.";
  } else if (title.length > 100) {
    fieldErrors.title = "Название не должно превышать 100 символов.";
  }

  if (!description) {
    fieldErrors.description = "Описание события обязательно для заполнения.";
  } else if (description.length < 5) {
    fieldErrors.description = "Описание должно быть подробным (хотя бы 7 символов).";
  } else if (description.length > 1000) {
    fieldErrors.description = "Описание не должно превышать 1000 символов.";
  }

  if (type !== "open" && type !== "closed") {
    fieldErrors.type = "Выберите корректный тип группы (Открытая или Закрытая).";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  let formattedTags: string | null = null;
  if (tagsRaw) {
    const cleanedTags = tagsRaw
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    formattedTags = cleanedTags.length > 0 ? cleanedTags.join(", ") : null;
  }

  try {
    await db.insert(events).values({
      creatorId: session.id,
      title,
      description,
      type,
      tags: formattedTags,
    });
  } catch (dbError) {
    console.error("Ошибка при записи события в БД:", dbError);
    return { error: "Не удалось сохранить событие в базу данных. Попробуйте позже." };
  }

  revalidatePath("/events");
  
  redirect("/events");
}

export{
  createEvent,
  type ActionState
}