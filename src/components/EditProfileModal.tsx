"use client";

import { useState } from "react";
import { Settings, X, Check, Hash } from "lucide-react";
import { updateProfileData } from "@/lib/actions";

interface EditProfileModalProps {
  user: {
    name: string;
    university: string | null;
    faculty: string | null;
    isGraduated: boolean | null;
    course: number | null;
    hobbies: string[] | null;
    bio: string | null;
  };
}

export default function EditProfileModal({ user }: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [name, setName] = useState(user.name);
  const [university, setUniversity] = useState(user.university || "");
  const [isGraduated, setIsGraduated] = useState(user.isGraduated || false);
  const [faculty, setFaculty] = useState(user.faculty || "");
  const [course, setCourse] = useState<string>(user.course ? String(user.course) : "");
  const [bio, setBio] = useState(user.bio || "");
  
  const [hobbies, setHobbies] = useState<string[]>(user.hobbies || []);
  const [hobbyInput, setHobbyInput] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddHobby = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = hobbyInput.trim().toLowerCase().replace(/#/g, "");
      if (tag && !hobbies.includes(tag)) {
        setHobbies([...hobbies, tag]);
      }
      setHobbyInput("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    try {
      await updateProfileData({
        university,
        faculty: isGraduated ? "Выпускник" : faculty,
        isGraduated,
        course: isGraduated ? null : (course ? Number(course) : null),
        hobbies, 
        bio,
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Не удалось сохранить изменения");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-4 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
      >
        <Settings className="w-4 h-4" />
        Редактировать профиль
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-black shadow-2xl border border-gray-100">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold">Настройки профиля</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Университет *</label>
                <input 
                  type="text" 
                  value={university} 
                  onChange={(e) => setUniversity(e.target.value)} 
                  className="w-full text-sm px-4 py-3 bg-gray-50 rounded-xl border-none outline-hidden focus:ring-2 focus:ring-pink-500" 
                  required 
                />
              </div>

              <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl cursor-pointer border border-gray-100">
                <input 
                  type="checkbox" 
                  checked={isGraduated} 
                  onChange={(e) => setIsGraduated(e.target.checked)} 
                  className="rounded-sm border-gray-300 text-pink-500 h-4 w-4 focus:ring-pink-500" 
                />
                <span className="text-xs font-medium text-gray-700">Я окончил учебное заведение</span>
              </label>

              {!isGraduated && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Факультет *</label>
                    <input 
                      type="text" 
                      value={faculty} 
                      onChange={(e) => setFaculty(e.target.value)} 
                      className="w-full text-sm px-4 py-3 bg-gray-50 rounded-xl border-none outline-hidden focus:ring-2 focus:ring-pink-500" 
                      required={!isGraduated} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Курс *</label>
                    <select 
                      value={course} 
                      onChange={(e) => setCourse(e.target.value)} 
                      className="w-full text-sm px-2 py-3 bg-gray-50 rounded-xl border-none outline-hidden focus:ring-2 focus:ring-pink-500 bg-none" 
                      required={!isGraduated}
                    >
                      <option value="">-</option>
                      {[1,2,3,4,5,6].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">О себе</label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  rows={3} 
                  placeholder="Расскажи что-нибудь интересное о себе..." 
                  className="w-full text-sm px-4 py-3 bg-gray-50 rounded-xl border-none outline-hidden focus:ring-2 focus:ring-pink-500 resize-none" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Увлечения *</label>
                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-xl min-h-[40px]">
                  {hobbies.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-pink-50 text-pink-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-pink-100">
                      #{tag}
                      <button type="button" onClick={() => setHobbies(hobbies.filter((_, i) => i !== idx))} className="hover:bg-pink-200 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={hobbyInput} 
                    onChange={(e) => setHobbyInput(e.target.value)} 
                    onKeyDown={handleAddHobby} 
                    placeholder="добавь хобби (нажми Enter)..." 
                    className="w-full text-sm pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl border-none outline-hidden focus:ring-2 focus:ring-pink-500" 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving || !university.trim() || hobbies.length === 0}
                className="w-full mt-2 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                {success ? <Check className="w-4 h-4" /> : isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}