"use client"

import { ChevronDown, Circle, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { User, TomState, WeatherDay } from "@/lib/types"

interface MobileHeaderProps {
  user: User
  users: User[]
  onUserChange: (user: User) => void
  weather: WeatherDay
  tomState: TomState
  onTomClick: () => void
}

export function MobileHeader({ user, users, onUserChange, weather, tomState, onTomClick }: MobileHeaderProps) {
  const isOnCall = tomState.status === "on_call"

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1">
          <span className="font-medium">{user.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {users.map((u) => (
            <DropdownMenuItem key={u.id} onClick={() => onUserChange(u)} className="flex items-center justify-between">
              <span>{u.name}</span>
              {u.id === user.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tom status */}
      <button
        onClick={onTomClick}
        className={`flex items-center gap-2 rounded-full px-3 py-1 ${
          isOnCall ? "bg-blue-100 dark:bg-blue-950" : "bg-muted"
        }`}
      >
        <Circle className={`h-2 w-2 fill-current ${isOnCall ? "text-blue-500" : "text-green-500"}`} />
        <span className={`text-sm ${isOnCall ? "font-medium text-blue-600 dark:text-blue-400" : ""}`}>
          {isOnCall ? "Live Call" : "Idle"}
        </span>
      </button>

      {/* Weather */}
      <div className="flex items-center gap-1 text-sm">
        <span>{weather.temp}°</span>
        {weather.alert && <span className="font-medium text-red-600 dark:text-red-400">!</span>}
      </div>
    </header>
  )
}
