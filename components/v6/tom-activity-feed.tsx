"use client"

import type React from "react"

import { Clock, Phone, DollarSign, Send, AlertCircle, ThumbsUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface TomActivity {
  id: string
  time: string
  type: "call" | "booking" | "chase" | "action" | "escalation" | "adjustment"
  description: string
  icon: React.ReactNode
  color: string
}

interface TomActivityFeedProps {
  activities: TomActivity[]
}

export function TomActivityFeed({ activities }: TomActivityFeedProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Tom's Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-slate-800/50 rounded transition-colors">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", activity.color)}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200">{activity.description}</p>
              <p className="text-xs text-slate-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Helper to create activities
export function createTomActivities(): TomActivity[] {
  return [
    {
      id: "1",
      time: "2:34pm",
      type: "booking",
      description: "Booked antenna job - Mrs Chen, Joondalup, $380",
      icon: <ThumbsUp className="w-4 h-4 text-green-400" />,
      color: "bg-green-900/30",
    },
    {
      id: "2",
      time: "2:15pm",
      type: "call",
      description: "Called David Chen about $495 overdue - left voicemail",
      icon: <Phone className="w-4 h-4 text-blue-400" />,
      color: "bg-blue-900/30",
    },
    {
      id: "3",
      time: "2:02pm",
      type: "action",
      description: "Sent AJ his Monday jobs via SMS",
      icon: <Send className="w-4 h-4 text-slate-400" />,
      color: "bg-slate-800",
    },
    {
      id: "4",
      time: "1:45pm",
      type: "adjustment",
      description: "Lowered antenna bids by 15% (Andy requested)",
      icon: <TrendingDown className="w-4 h-4 text-amber-400" />,
      color: "bg-amber-900/30",
    },
    {
      id: "5",
      time: "1:30pm",
      type: "escalation",
      description: "Complaint call from Mrs Williams - escalated to Steve",
      icon: <AlertCircle className="w-4 h-4 text-red-400" />,
      color: "bg-red-900/30",
    },
    {
      id: "6",
      time: "1:15pm",
      type: "chase",
      description: "Chased Terry Jones - promised payment Friday",
      icon: <DollarSign className="w-4 h-4 text-green-400" />,
      color: "bg-green-900/30",
    },
  ]
}
