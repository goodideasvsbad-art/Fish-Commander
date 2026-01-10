"use client"

import { useState } from "react"
import { TomStatus } from "./tom-status"
import { CurrentJob } from "./current-job"
import { JobQueue } from "./job-queue"
import { LiveCall } from "./live-call"
import { QuickActions } from "./quick-actions"
import { TomVoice } from "./tom-voice"

export function TomDashboard() {
  const [tomState, setTomState] = useState<"idle" | "on-call" | "processing">("idle")
  const [showLiveCall, setShowLiveCall] = useState(false)

  // Demo: simulate Tom taking a call
  const handleTomCall = () => {
    setTomState("on-call")
    setShowLiveCall(true)
  }

  const handleEndCall = () => {
    setTomState("idle")
    setShowLiveCall(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-secondary">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">T</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-secondary-foreground">Tom Commander</h1>
              <p className="text-xs text-secondary-foreground/70">Your AI business mate</p>
            </div>
          </div>
          <TomStatus state={tomState} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-6">
        {/* Tom Voice - Always accessible */}
        <TomVoice onSimulateCall={handleTomCall} />

        {/* Live Call Panel - Only shows when Tom is on a call */}
        {showLiveCall && <LiveCall onEndCall={handleEndCall} />}

        {/* Main Content Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left Column - Current & Next Job */}
          <div className="space-y-6 lg:col-span-2">
            <CurrentJob />
            <JobQueue />
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            <QuickActions />
            <TodayStats />
          </div>
        </div>
      </main>
    </div>
  )
}

function TodayStats() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-muted-foreground">Today so far</h3>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold text-foreground">7</p>
          <p className="text-sm text-muted-foreground">Calls handled</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground">3</p>
          <p className="text-sm text-muted-foreground">Jobs booked</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-accent">$2,400</p>
          <p className="text-sm text-muted-foreground">Quotes sent</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground">12m</p>
          <p className="text-sm text-muted-foreground">Avg call time</p>
        </div>
      </div>
    </div>
  )
}
