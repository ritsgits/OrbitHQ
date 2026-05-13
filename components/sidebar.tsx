"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Settings, 
  Orbit,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { logoutAction } from "@/actions/auth-actions"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "CRM",
    icon: Target,
    href: "/crm",
    color: "text-violet-500",
  },
  {
    label: "Projects",
    icon: Briefcase,
    href: "/projects",
    color: "text-pink-700",
  },
  {
    label: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
    color: "text-orange-700",
  },
  {
    label: "Team",
    icon: Users,
    href: "/team",
    color: "text-emerald-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export const Sidebar = () => {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-card border-r transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="px-3 py-4 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-10 group">
          <div className="relative w-8 h-8 mr-4 bg-primary rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
            <Orbit className="text-primary-foreground w-5 h-5" />
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold tracking-tight">
              OrbitHQ
            </h1>
          )}
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                pathname === route.href ? "bg-primary/10 text-primary" : "text-muted-foreground",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color)} />
                {!isCollapsed && <span>{route.label}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t space-y-2">
        {!isCollapsed && (
          <Button variant="outline" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        )}
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-rose-500"
          onClick={() => logoutAction()}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
