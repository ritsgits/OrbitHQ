"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { loginAction } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof LoginSchema>

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await loginAction(data)
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
      console.error("Login component error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    
    <Card className="border-non
    e shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your workspace.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm font-medium text-rose-500 bg-rose-500/10 rounded-lg border border-rose-500/20">
              {error}
            </div>
          )}
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
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </Button>
        </CardContent>
      </form>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  )
  
}
