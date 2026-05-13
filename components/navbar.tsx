import { Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { auth } from "@/auth"
import { UserAccountNav } from "@/components/user-account-nav"
import { NotificationCenter } from "@/components/notification-center"

export const Navbar = async () => {
  const session = await auth();

  return (
    <div className="flex items-center p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex w-full justify-end items-center gap-x-4">
        <div className="relative flex-1 max-w-sm hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search anything..."
            className="w-full bg-muted/50 border rounded-full pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors hover:bg-muted"
          />
        </div>
        <ModeToggle />
        <NotificationCenter />
        {session?.user && <UserAccountNav user={session.user} />}
      </div>
    </div>
  )
}
