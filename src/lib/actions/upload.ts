"use server";

import { s3Client } from "../minio";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/db/index";
import { uploads, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface UploadResponse {
  success: boolean;
  error?: string;
  avatarUrl?: string;
}

async function uploadAvatarAction(
  userId: string,
  formData: FormData
): Promise<UploadResponse> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Файл не найден" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > 5 * 1024 * 1024) {
      return { success: false, error: "Размер файла превышает лимит 5MB" };
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      return { success: false, error: "Неподдерживаемый формат. Разрешены только JPEG, PNG и WebP" };
    }

    const fileExtension = file.name.split(".").pop();
    const uniqueKey = `avatars/${userId}-${Date.now()}.${fileExtension}`;
    const bucketName = process.env.MINIO_BUCKET_NAME || "avatars";

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const [newUpload] = await db.insert(uploads).values({
      key: uniqueKey,
      bucket: bucketName,
      mimeType: file.type,
      size: buffer.length,
    }).returning();

    await db.update(users)
      .set({ avatarId: newUpload.id })
      .where(eq(users.id, userId));

    const publicUrl = `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL}/${bucketName}/${uniqueKey}`;

    return {
      success: true,
      avatarUrl: publicUrl,
    };
  } catch (err) {
    console.error("Ошибка при выполнении экшена uploadAvatar:", err);
    return { success: false, error: "Не удалось сохранить файл на сервере" };
  }
}

export{
  uploadAvatarAction
}