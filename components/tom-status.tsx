"use client"

import { Phone, Loader2, Coffee } from "lucide-react"

interface TomStatusProps {
  state: "idle" | "on-call" | "processing"
}

export function TomStatus({ state }: TomStatusProps) {
  const statusConfig = {
    idle: {
      icon: Coffee,
      label: "Tom's ready",
      color: "bg-accent",
      pulse: false,
    },
    "on-call": {
      icon: Phone,
      label: "Tom's on a call",
      color: "bg-primary",
      pulse: true,
    },
    processing: {
      icon: Loader2,
      label: "Tom's thinking",
      color: "bg-primary",
      pulse: false,
    },
  }

  const config = statusConfig[state]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2 rounded-full bg-secondary-foreground/10 px-3 py-1.5">
      <div className="relative">
        <div className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
        {config.pulse && <div className={`absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full ${config.color}`} />}
      </div>
      <span className="text-sm font-medium text-secondary-foreground">{config.label}</span>
      <Icon className={`h-4 w-4 text-secondary-foreground ${state === "processing" ? "animate-spin" : ""}`} />
    </div>
  )
}
