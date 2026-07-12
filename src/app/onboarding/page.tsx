"use client";

import { useState } from "react";
import { X, School, Award, Hash, GraduationCap } from "lucide-react";
import { completeOnboarding } from "@/lib/actions";

export default function OnboardingPage() {
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [isGraduated, setIsGraduated] = useState(false);
  const [course, setCourse] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [hobbyInput, setHobbyInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = hobbyInput.trim().toLowerCase().replace(/#/g, "");
      if (tag && !hobbies.includes(tag)) {
        setHobbies([...hobbies, tag]);
      }
      setHobbyInput("");
    }
  };

  const removeHobby = (indexToRemove: number) => {
    setHobbies(hobbies.filter((_, i) => i !== indexToRemove));
  };

  const isValid = 
    university.trim() && 
    (isGraduated || (faculty.trim() && course)) && 
    hobbies.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-8 text-black">
      <div className="mx-auto w-full max-w-md bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">Заполни профиль UNITY</h1>
          <p className="text-xs text-gray-500 mt-1">Без этого мы не сможем подобрать тебе идеальное окружение</p>
        </div>

        <form action={completeOnboarding} className="space-y-4">

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Университет *</label>
            <div className="relative">
              <School className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="university"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Например, МГТУ им. Баумана"
                className="w-full text-sm pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isGraduated"
              value="true"
              checked={isGraduated}
              onChange={(e) => setIsGraduated(e.target.checked)}
              className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <div className="text-xs">
              <p className="font-semibold text-gray-700">Я уже окончил обучение</p>
              <p className="text-gray-400">Пометка «Выпускник» вместо факультета</p>
            </div>
          </label>

          {!isGraduated && (
            <div className="grid grid-cols-3 gap-2 animate-fade-in">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Факультет *</label>
                <input
                  type="text"
                  name="faculty"
                  required={!isGraduated}
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="ИУ, РЛ, БМТ..."
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Курс *</label>
                <select
                  name="course"
                  required={!isGraduated}
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full text-sm px-2 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">Выбери</option>
                  {[1, 2, 3, 4, 5, 6].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">Твои увлечения (Минимум 1) *</label>
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-xl border border-dashed border-gray-200 min-h-[38px]">
              {hobbies.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full border border-indigo-100">
                  #{tag}
                  <button type="button" onClick={() => removeHobby(idx)} className="hover:bg-indigo-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={hobbyInput}
                onChange={(e) => setHobbyInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="баскетбол, дизайн (нажми Enter)"
                className="w-full text-sm pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <input type="hidden" name="hobbies" value={JSON.stringify(hobbies)} />

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-2.5 rounded-xl font-medium text-sm text-white transition-all ${
              isValid ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Войти на сайт
          </button>
        </form>
      </div>
    </div>
  );
}