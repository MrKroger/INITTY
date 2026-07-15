import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateEventForm } from "@/components/CreateEventForm";

export default async function CreateEventPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-6 py-4 flex items-center border-b">
        <Link href="/events" className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Создать событие</h1>
      </header>

      <CreateEventForm />
    </div>
  );
}