"use client";

interface UserAvatarProps {
  avatar: {
    key: string;
    bucket: string;
  } | null | undefined;
  userId: string;
  userName: string;
  className?: string;
  withBorder?: boolean;
  roundedClass?: string;
}

export function UserAvatar({
  avatar,
  userId,
  userName,
  className = "w-16 h-16",
  withBorder = false,
  roundedClass = "rounded-full",
}: UserAvatarProps) {
  const avatarUrl = avatar?.key
    ? `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL}/${avatar.bucket}/${avatar.key}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

  return (
    <img
      src={avatarUrl}
      alt={userName}
      className={`
        ${className} 
        ${roundedClass} 
        object-cover 
        ${withBorder ? "border-2 border-pink-500 p-0.5" : ""}
      `}
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
      }}
    />
  );
}