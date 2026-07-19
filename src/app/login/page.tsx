import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";

async function LoginPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <LoginForm />
    </div>
  );
}

export default LoginPage;