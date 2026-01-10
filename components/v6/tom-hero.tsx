"use client"

import { useState, useEffect } from "react"
import { Phone, Activity, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UserRole, TomMood, TomStats } from "@/lib/types"
import { tomGreetings, tomRecentActivity } from "@/lib/mock-data"

interface TomHeroProps {
  currentRole: UserRole
  tomMood: TomMood
  stats: TomStats
  onTalkToTom: () => void
}

// Tom avatar URLs based on mood
const TOM_AVATARS: Record<TomMood, string> = {
  welcoming:
    "/images/u9681566679-cartoon-illustration-of-a-friendly-older-man-with-0d9acd05-07b9-495d-9ce2-25acf85f6900-0.png",
  "thumbs-up":
    "/images/u9681566679-cartoon-older-man-with-grey-beard-glasses-headset-f26c9a04-7907-42c5-90b8-3c831131f866-3.png",
  thoughtful: "/images/u9681566679-httpss.png",
  smirk:
    "/images/u9681566679-friendly-cartoon-older-man-grey-beard-glasses-hea-30802611-b63c-4962-b6e0-c129bf5b9d89-3.png",
  "on-call":
    "/images/u9681566679-cartoon-portrait-of-friendly-older-man-with-grey-b98f39fd-298d-49cc-9bad-e86e2a9d851d-3.png",
  concerned:
    "/images/u9681566679-friendly-cartoon-face-portrait-of-an-older-man-wi-b5ba9f6a-0cfc-49f1-b97e-db7f63e98c27-1.png",
}

export function TomHero({ currentRole, tomMood, stats, onTalkToTom }: TomHeroProps) {
  const [greetingIndex, setGreetingIndex] = useState(0)

  // Rotate through greetings for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % tomGreetings[currentRole].length)
    }, 8000)
    return () => clearInterval(interval)
  }, [currentRole])

  const greeting = tomGreetings[currentRole][greetingIndex]
  const recentActivity = tomRecentActivity[currentRole]

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Tom Hero Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-amber-900/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Tom Avatar */}
            <div className="shrink-0">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-amber-500/30 bg-amber-500/10">
                  <img
                    src={TOM_AVATARS[tomMood] || "/placeholder.svg"}
                    alt="Tom"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Status Indicator */}
                <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-slate-900 rounded-full px-2 py-1 border-2 border-slate-800">
                  <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                  <span className="text-xs font-medium text-green-400">Live</span>
                </div>
              </div>
            </div>

            {/* Tom's Speech */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Tom Commander</h2>
                  <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30">AI Assistant</Badge>
                </div>

                {/* Greeting Speech Bubble */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-200 leading-relaxed">{greeting}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={onTalkToTom} className="bg-amber-600 hover:bg-amber-700 text-white font-medium">
                  <Phone className="w-4 h-4 mr-2" />
                  Talk to Tom
                </Button>

                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {currentRole === "sharon" && "Chase Invoices"}
                  {currentRole === "andy" && "Marketing Report"}
                  {currentRole === "ross" && "Review Escalations"}
                  {currentRole === "steve" && "Assign Jobs"}
                  {currentRole === "tech" && "What's Next?"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Stats */}
        <Card className="bg-slate-900 border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Tom's Activity Today</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-2xl font-bold text-white">{stats.callsToday}</p>
              <p className="text-xs text-slate-400">Calls Handled</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.bookingsToday}</p>
              <p className="text-xs text-slate-400">Jobs Booked</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-300">{stats.avgCallTime}</p>
              <p className="text-xs text-slate-400">Avg Call Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.missedCalls}</p>
              <p className="text-xs text-slate-400">Missed Calls</p>
            </div>
          </div>
        </Card>

        {/* Tom's Recent Activity */}
        <Card className="bg-slate-900 border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">What Tom's Been Up To</h3>
          <div className="space-y-2">
            {recentActivity.slice(0, 3).map((activity, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-slate-300 leading-snug">{activity}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
