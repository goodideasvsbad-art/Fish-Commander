"use client"

import { useState } from "react"
import { Mail, Voicemail, AlertTriangle, Phone, CheckCircle2, ArrowRight, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { mockRossInbox } from "@/lib/mock-data"

type InboxFilter = "all" | "escalations" | "voicemails" | "emails"

export function RossDashboard() {
  const [filter, setFilter] = useState<InboxFilter>("all")

  const items = mockRossInbox.filter((item) => {
    if (filter === "all") return true
    if (filter === "escalations") return item.type === "escalation"
    if (filter === "voicemails") return item.type === "voicemail"
    if (filter === "emails") return item.type === "email"
    return true
  })

  const counts = {
    all: mockRossInbox.length,
    escalations: mockRossInbox.filter((i) => i.type === "escalation").length,
    voicemails: mockRossInbox.filter((i) => i.type === "voicemail").length,
    emails: mockRossInbox.filter((i) => i.type === "email").length,
  }

  const typeIcons = {
    escalation: <AlertTriangle className="w-4 h-4" />,
    voicemail: <Voicemail className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
  }

  const typeColors = {
    escalation: "bg-red-900/30 text-red-300 border-red-700",
    voicemail: "bg-blue-900/30 text-blue-300 border-blue-700",
    email: "bg-slate-800 text-slate-300 border-slate-700",
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{counts.escalations}</p>
            <p className="text-xs text-red-300">Escalations</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/20 border-blue-800">
          <CardContent className="p-4 text-center">
            <Voicemail className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{counts.voicemails}</p>
            <p className="text-xs text-blue-300">Voicemails</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <Mail className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{counts.emails}</p>
            <p className="text-xs text-slate-300">Emails</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "escalations", "voicemails", "emails"] as InboxFilter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={cn(filter === f ? "bg-amber-600 hover:bg-amber-700" : "border-slate-700 text-slate-300")}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </Button>
        ))}
      </div>

      {/* Inbox Items */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Inbox className="w-5 h-5" />
          Your Inbox
        </h2>

        {items.map((item) => (
          <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Type Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    item.type === "escalation"
                      ? "bg-red-900/30"
                      : item.type === "voicemail"
                        ? "bg-blue-900/30"
                        : "bg-slate-800",
                  )}
                >
                  <span
                    className={cn(
                      item.type === "escalation"
                        ? "text-red-400"
                        : item.type === "voicemail"
                          ? "text-blue-400"
                          : "text-slate-400",
                    )}
                  >
                    {typeIcons[item.type]}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{item.from}</p>
                        <Badge variant="outline" className={typeColors[item.type]}>
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300 mt-0.5">{item.subject}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.preview}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{item.time}</span>
                  </div>

                  {/* Tom's Summary */}
                  {item.tomSummary && (
                    <div className="mt-2 p-2 bg-amber-900/20 border border-amber-800/50 rounded text-xs text-amber-300">
                      <span className="font-medium">Tom says:</span> {item.tomSummary}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {item.type === "escalation" && (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 h-8">
                        <Phone className="w-3 h-3 mr-1.5" />
                        Call Back
                      </Button>
                    )}
                    {item.type === "voicemail" && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8">
                        <Voicemail className="w-3 h-3 mr-1.5" />
                        Play
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 h-8 bg-transparent">
                      <CheckCircle2 className="w-3 h-3 mr-1.5" />
                      Mark Done
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-400 h-8">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
