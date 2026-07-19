"use client";

import { useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/actions/login";

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(false);

    const formData = new FormData(event.currentTarget);
    
    const result = await loginAction(formData);

    if (!result.success) {
      setError(result.error || "Произошла ошибка");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-pink-500 italic tracking-tighter mb-2">UNITY</h1>
        <p className="text-gray-500">Найди свою компанию в университете</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-center text-sm font-semibold border border-red-100 animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            disabled={loading}
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-pink-500 focus:ring-0 outline-none transition-all disabled:opacity-50"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Пароль"
            disabled={loading}
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-pink-500 focus:ring-0 outline-none transition-all disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-colors active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-pink-500 font-bold hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}

export{
    LoginForm
}