import { LoginForm } from "@/components/auth/login-form"
import { Orbit } from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await auth();

  if (session) {
    const resolvedSearchParams = await searchParams;
    const callbackUrl = resolvedSearchParams?.callbackUrl;

    if (typeof callbackUrl === "string" && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
      redirect(callbackUrl);
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-lg">
          <Orbit className="text-primary-foreground h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm max-w-[280px]">
          Enter your credentials to access your OrbitHQ workspace.
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
