import { Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { auth } from "@/auth"
import { UserAccountNav } from "@/components/user-account-nav"

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
            className="w-full bg-background border rounded-md pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <ModeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
        </Button>
        {session?.user && <UserAccountNav user={session.user} />}
      </div>
    </div>
  )
}
