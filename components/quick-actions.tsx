"use client"

import { Phone, FileText, Calendar, Users, Settings, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  const actions = [
    { icon: Phone, label: "Make a call", description: "Get Tom to call someone" },
    { icon: FileText, label: "Send quote", description: "Create and send a quote" },
    { icon: Calendar, label: "Book a job", description: "Schedule new work" },
    { icon: Users, label: "Customers", description: "View customer list" },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-muted-foreground">Quick actions</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col items-start p-4 text-left bg-transparent"
          >
            <action.icon className="h-5 w-5 text-primary" />
            <span className="mt-2 font-semibold text-foreground">{action.label}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">{action.description}</span>
          </Button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">
          <Settings className="mr-1.5 h-4 w-4" />
          Settings
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">
          <HelpCircle className="mr-1.5 h-4 w-4" />
          Help
        </Button>
      </div>
    </div>
  )
}
