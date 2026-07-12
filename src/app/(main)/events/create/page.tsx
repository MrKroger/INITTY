import { db } from "@/db";
import { events } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CreateEventPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  async function createEventAction(formData: FormData) {
    "use server";
    const session = await getSession();
    if (!session) return;

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const tags = formData.get("tags") as string;

    await db.insert(events).values({
      creatorId: session.id,
      title,
      description,
      type,
      tags,
    });

    redirect("/events");
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-6 py-4 flex items-center border-b">
        <Link href="/events" className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Создать событие</h1>
      </header>

      <form action={createEventAction} className="p-6 space-y-6 flex-1 overflow-y-auto pb-24">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Название события</label>
          <input
            name="title"
            required
            placeholder="Напр. Поход в кино"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Тип группы</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="relative flex items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors peer-checked:border-pink-500 peer-checked:bg-pink-50">
              <input type="radio" name="type" value="open" defaultChecked className="hidden peer" />
              <div className="text-center">
                <span className="block font-bold">Открытая</span>
                <span className="text-[10px] text-gray-500 leading-tight">Все добавляются автоматически</span>
              </div>
            </label>
            <label className="relative flex items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors peer-checked:border-pink-500 peer-checked:bg-pink-50">
              <input type="radio" name="type" value="closed" className="hidden peer" />
              <div className="text-center">
                <span className="block font-bold">Закрытая</span>
                <span className="text-[10px] text-gray-500 leading-tight">Вы одобряете каждую заявку</span>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Тэги (через запятую)</label>
          <input
            name="tags"
            placeholder="кино, отдых, знакомства"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Описание</label>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Опишите суть события подробнее..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors active:scale-[0.98]"
        >
          Создать мероприятие
        </button>
      </form>
    </div>
  );
}
