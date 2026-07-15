"use client";

import { useActionState } from "react";
import { createEvent, ActionState } from "@/lib/actions/events";
import { Loader2 } from "lucide-react";

export function CreateEventForm() {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    createEvent,
    null
  );

  return (
    <form action={formAction} className="p-6 space-y-6 flex-1 overflow-y-auto pb-24">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Название события</label>
        <input
          name="title"
          disabled={isPending}
          placeholder="Напр. Поход в кино"
          className={`w-full px-4 py-3 rounded-xl border ${
            state?.fieldErrors?.title ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-pink-500"
          } focus:ring-2 outline-none transition-all disabled:opacity-50`}
        />
        {state?.fieldErrors?.title && (
          <p className="text-xs text-red-500 font-medium">{state.fieldErrors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Тип группы</label>
        <div className="grid grid-cols-2 gap-4">
          <label className="relative flex items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50">
            <input 
              type="radio" 
              name="type" 
              value="open" 
              defaultChecked 
              disabled={isPending}
              className="hidden peer" 
            />
            <div className="text-center">
              <span className="block font-bold">Открытая</span>
              <span className="text-[10px] text-gray-500 leading-tight">Все добавляются автоматически</span>
            </div>
          </label>
          <label className="relative flex items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50">
            <input 
              type="radio" 
              name="type" 
              value="closed" 
              disabled={isPending}
              className="hidden peer" 
            />
            <div className="text-center">
              <span className="block font-bold">Закрытая</span>
              <span className="text-[10px] text-gray-500 leading-tight">Вы одобряете каждую заявку</span>
            </div>
          </label>
        </div>
        {state?.fieldErrors?.type && (
          <p className="text-xs text-red-500 font-medium">{state.fieldErrors.type}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Тэги (через запятую)</label>
        <input
          name="tags"
          disabled={isPending}
          placeholder="кино, отдых, знакомства"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Описание</label>
        <textarea
          name="description"
          rows={5}
          disabled={isPending}
          placeholder="Опишите суть события подробнее..."
          className={`w-full px-4 py-3 rounded-xl border ${
            state?.fieldErrors?.description ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-pink-500"
          } focus:ring-2 outline-none transition-all resize-none disabled:opacity-50`}
        />
        {state?.fieldErrors?.description && (
          <p className="text-xs text-red-500 font-medium">{state.fieldErrors.description}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors active:scale-[0.98] disabled:bg-pink-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Создание...
          </>
        ) : (
          "Создать мероприятие"
        )}
      </button>
    </form>
  );
}