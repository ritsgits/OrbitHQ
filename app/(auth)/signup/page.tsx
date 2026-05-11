import { SignupForm } from "@/components/auth/signup-form"
import { Orbit } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="flex flex-col space-y-6 w-full max-w-lg mx-auto">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-lg">
          <Orbit className="text-primary-foreground h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground text-sm max-w-[320px]">
          Join OrbitHQ today and start managing your team and projects in one place.
        </p>
      </div>
      <SignupForm />
    </div>
  )
}
