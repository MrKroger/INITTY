import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import EditProfileModal from "@/components/EditProfileModal";

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const hobbiesList = user.hobbies || [];

  return (
    <div className="flex flex-col h-full bg-white text-black">
      <header className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold">Профиль</h1>
        <form action={async () => { "use server"; await logout(); redirect("/login"); }}>
           <button className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><LogOut size={20} /></button>
        </form>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Аватар, Имя и кнопка вызова Модалки настроек */}
        <div className="p-8 flex flex-col items-center border-b border-gray-50">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-full h-full object-cover" alt="Avatar" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">{user.name}</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {user.university || "ВУЗ не указан"} 
            {user.faculty && ` • ${user.faculty}`}
            {user.course && ` (${user.course} курс)`}
          </p>

          <EditProfileModal user={user} />
        </div>

        {/* Блок аккуратного вывода информации о пользователе */}
        <div className="p-6 space-y-6">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">О себе</h4>
            <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-700 leading-relaxed min-h-[60px]">
              {user.bio || <span className="text-gray-400 italic">Информация не заполнена.</span>}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Мои Увлечения</h4>
            {hobbiesList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {hobbiesList.map((hobby, index) => (
                  <span key={index} className="inline-flex items-center text-xs font-semibold bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full">
                    #{hobby}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Увлечения не добавлены</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}