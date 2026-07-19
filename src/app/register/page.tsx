import { db } from "@/db";
import { users } from "@/db/schema";
import { login } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

function RegisterPage() {
  async function handleRegister(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password, // В будущем bcrypt, пока заглушка
    }).returning();

    if (newUser) {
      await login(newUser.id);
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-pink-500 italic tracking-tighter mb-2">UNITY</h1>
          <p className="text-gray-500">Присоединяйся к сообществу</p>
        </div>

        <form action={handleRegister} className="mt-8 space-y-6">
          <div className="space-y-4">
            <input
              name="name"
              type="text"
              required
              placeholder="Имя"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-pink-500 focus:ring-0 outline-none transition-all"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-pink-500 focus:ring-0 outline-none transition-all"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Пароль"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-pink-500 focus:ring-0 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-colors active:scale-[0.98]"
          >
            Создать аккаунт
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-pink-500 font-bold hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;