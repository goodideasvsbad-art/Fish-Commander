"use client"

import { Radio, ChevronDown, Zap, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { UserRole, TomState } from "@/lib/types"

interface HeaderProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
  onSimulateCall: () => void
  tomState: TomState
}

const roleLabels: Record<UserRole, string> = {
  andy: "Andy",
  sharon: "Sharon",
  ross: "Ross",
  steve: "Steve",
  tech: "Tech",
}

const roleColors: Record<UserRole, string> = {
  andy: "bg-purple-600",
  sharon: "bg-amber-600",
  ross: "bg-red-600",
  steve: "bg-blue-600",
  tech: "bg-green-600",
}

export function Header({ currentRole, onRoleChange, onSimulateCall, tomState }: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">FISH COMMANDER</h1>
            <p className="text-xs text-slate-400">Office Manager</p>
          </div>
        </div>

        {/* Center: Tom Status Beacon */}
        <div className="hidden md:flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              tomState === "on-call"
                ? "bg-green-500 animate-pulse"
                : tomState === "wrap-up"
                  ? "bg-amber-500"
                  : tomState === "paused"
                    ? "bg-red-500"
                    : "bg-slate-600"
            }`}
          />
          <span className="text-sm text-slate-300">
            {tomState === "on-call"
              ? "Tom is on a live call"
              : tomState === "wrap-up"
                ? "Tom is wrapping up"
                : tomState === "paused"
                  ? "Tom is paused"
                  : "Tom is standing by"}
          </span>
        </div>

        {/* Right: Role Switcher & Demo */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(
                '/fish-chat-good.html',
                'fishchat',
                'width=500,height=800,left=100,top=100,resizable=yes,scrollbars=yes'
              )
            }}
            className="hidden sm:flex gap-2 border-amber-600 text-amber-400 hover:bg-amber-950 bg-transparent"
          >
            <MessageCircle className="w-4 h-4" />
            Fish Chat
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSimulateCall}
            className="hidden sm:flex gap-2 border-green-600 text-green-400 hover:bg-green-950 bg-transparent"
          >
            <Zap className="w-4 h-4" />
            Demo Call
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className={`w-2 h-2 rounded-full ${roleColors[currentRole]}`} />
                <span className="hidden sm:inline">{roleLabels[currentRole]}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
              {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className="gap-2 text-slate-200 focus:bg-slate-800"
                >
                  <div className={`w-2 h-2 rounded-full ${roleColors[role]}`} />
                  {roleLabels[role]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
