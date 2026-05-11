"use client"

import { logoutAction } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { LogOut, User as UserIcon } from "lucide-react"

export function UserAccountNav({ user }: { user: any }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end hidden md:flex">
        <p className="text-sm font-medium leading-none">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
        <UserIcon className="h-5 w-5 text-primary" />
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => logoutAction()}
        title="Logout"
      >
        <LogOut className="h-5 w-5 text-muted-foreground hover:text-rose-500 transition-colors" />
      </Button>
    </div>
  )
}
