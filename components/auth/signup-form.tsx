"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signUpAction } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
})

type SignupFormValues = z.infer<typeof SignupSchema>

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signUpAction(data)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else if (result?.success) {
        // Force a full browser refresh to ensure session cookies are recognized on production Vercel
        window.location.href = "/dashboard"
      } else {
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error("Signup component error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Get Started</CardTitle>
        <CardDescription className="text-center">
          Create your account and workspace to start managing projects.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm font-medium text-rose-500 bg-rose-500/10 rounded-lg border border-rose-500/20">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                {...register("name")}
                disabled={isLoading}
                placeholder="John Doe"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Workspace Name</label>
              <input
                {...register("workspaceName")}
                disabled={isLoading}
                placeholder="Acme Inc."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.workspaceName && (
                <p className="text-xs text-rose-500">{errors.workspaceName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              {...register("email")}
              disabled={isLoading}
              type="email"
              placeholder="name@example.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.email && (
              <p className="text-xs text-rose-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              {...register("password")}
              disabled={isLoading}
              type="password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.password && (
              <p className="text-xs text-rose-500">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-10" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account & Workspace"}
          </Button>
        </CardContent>
      </form>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline font-medium">
            Log in
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
