import { db } from "@/db";
import { users } from "@/db/schema";
import { login } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user && user.password === password) { // Заглушка для простоты тестирования
      await login(user.id);
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-pink-500 italic tracking-tighter mb-2">UNITY</h1>
          <p className="text-gray-500">Найди свою компанию в университете</p>
        </div>

        <form action={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
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
            Войти
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-pink-500 font-bold hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
