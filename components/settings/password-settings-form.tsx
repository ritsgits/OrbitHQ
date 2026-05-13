"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updatePasswordAction } from "@/actions/profile-actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function PasswordSettingsForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof PasswordSchema>) => {
    setIsLoading(true)
    const result = await updatePasswordAction(data)
    setIsLoading(false)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      })
    } else {
      toast({
        variant: "success",
        title: "Success",
        description: result.success,
      })
      reset()
    }
  }

  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Change your password to keep your account secure.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              placeholder="••••••••"
              className="bg-background/50"
            />
            {errors.currentPassword && (
              <p className="text-xs text-rose-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                placeholder="••••••••"
                className="bg-background/50"
              />
              {errors.newPassword && (
                <p className="text-xs text-rose-500">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                placeholder="••••••••"
                className="bg-background/50"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} variant="outline" className="w-full md:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
