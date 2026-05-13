"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { updateProfileAction } from "@/actions/profile-actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

export function ProfileSettingsForm({ user }: { user: any }) {
  const { toast } = useToast()
  const { update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user.name || "",
    },
  })

  async function onSubmit(data: z.infer<typeof ProfileSchema>) {
    console.log("Form submission triggered with data:", data)
    setIsLoading(true)
    try {
      const result = await updateProfileAction(data)
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else {
        // Update session client-side
        await update({
          ...user,
          name: data.name,
        })
        
        toast({
          variant: "success",
          title: "Profile updated",
          description: "Your display name has been updated successfully.",
        })
        
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "U"

  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details and display name.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-2 border-primary/10">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="text-xl font-bold bg-primary/5 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your Name" 
                        className="bg-background/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="text-muted-foreground">Email Address</FormLabel>
                <Input
                  value={user.email}
                  disabled
                  className="bg-muted cursor-not-allowed opacity-70"
                />
              </div>

              <div className="space-y-2">
                <FormLabel className="text-muted-foreground">Workspace Role</FormLabel>
                <Input
                  value={user.workspaceRole}
                  disabled
                  className="bg-muted cursor-not-allowed capitalize opacity-70"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Role is managed by your workspace administrator.
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full md:w-auto min-w-[140px]"
              onClick={() => console.log("Save Changes button clicked")}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
