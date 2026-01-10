"use client"

import type React from "react"

import { Cloud, Phone, Mail, Database, CheckCircle2, AlertCircle, Circle } from "lucide-react"

interface SystemStatus {
  name: string
  status: "ok" | "warning" | "error" | "disconnected"
  lastSync?: string
  icon: React.ReactNode
}

const systems: SystemStatus[] = [
  { name: "Ascora", status: "ok", lastSync: "2 min ago", icon: <Database className="w-3.5 h-3.5" /> },
  { name: "Twilio", status: "ok", lastSync: "Live", icon: <Phone className="w-3.5 h-3.5" /> },
  { name: "Gmail", status: "ok", lastSync: "5 min ago", icon: <Mail className="w-3.5 h-3.5" /> },
  { name: "Weather", status: "ok", lastSync: "1 hr ago", icon: <Cloud className="w-3.5 h-3.5" /> },
]

const statusColors = {
  ok: "text-green-400",
  warning: "text-amber-400",
  error: "text-red-400",
  disconnected: "text-slate-500",
}

const statusIcons = {
  ok: <CheckCircle2 className="w-3 h-3" />,
  warning: <AlertCircle className="w-3 h-3" />,
  error: <AlertCircle className="w-3 h-3" />,
  disconnected: <Circle className="w-3 h-3" />,
}

export function SystemStatusBar() {
  return (
    <div className="bg-slate-900/50 border-b border-slate-800/50 px-4 py-1.5">
      <div className="flex items-center gap-4 text-xs">
        <span className="text-slate-500 hidden sm:inline">Systems:</span>
        <div className="flex items-center gap-4 overflow-x-auto">
          {systems.map((system) => (
            <div key={system.name} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-slate-400">{system.icon}</span>
              <span className="text-slate-300">{system.name}</span>
              <span className={statusColors[system.status]}>{statusIcons[system.status]}</span>
              {system.lastSync && <span className="text-slate-500">({system.lastSync})</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
