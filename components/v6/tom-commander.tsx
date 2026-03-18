"use client"

import { useState } from "react"
import { Header } from "./header"
import { AndyDashboard } from "./dashboards/andy-dashboard"
import { SharonDashboard } from "./dashboards/sharon-dashboard"
import { RossDashboard } from "./dashboards/ross-dashboard"
import { SteveDashboard } from "./dashboards/steve-dashboard"
import { TechDashboard } from "./dashboards/tech-dashboard"
import { SystemStatusBar } from "./system-status-bar"
import { TomStatusPanel } from "./tom-status-panel"
import { TomActivityFeed, createTomActivities } from "./tom-activity-feed"
import { TalkToTomLive } from "./talk-to-tom-live"
import { WeatherWidget } from "./weather-widget"
import type { UserRole, TomState, TomMood, LiveCall, TomOutfit } from "@/lib/types"
import { mockLiveCall, mockTomStats, tomGreetings } from "@/lib/mock-data"
import { Phone, MessageSquare, Shirt } from "lucide-react"
import { TomAvatar } from "./tom-avatar"
import { TomClothingPicker } from "./tom-clothing-picker"

export function TomCommanderV6() {
  const [currentRole, setCurrentRole] = useState<UserRole>("sharon")
  const [tomState, setTomState] = useState<TomState>("idle")
  const [tomMood, setTomMood] = useState<TomMood>("welcoming")
  const [liveCall, setLiveCall] = useState<LiveCall | null>(null)
  const [liveActivities, setLiveActivities] = useState<Array<{id: string, text: string, time: string}>>([])
  const [tomOutfit, setTomOutfit] = useState<TomOutfit>({})
  const [showClothingPicker, setShowClothingPicker] = useState(false)

  const handleNewActivity = (activityText: string) => {
    const newActivity = {
      id: `activity_${Date.now()}`,
      text: activityText,
      time: new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    }
    setLiveActivities(prev => [newActivity, ...prev.slice(0, 9)]) // Keep last 10
  }

  const simulateCall = () => {
    setTomState("on-call")
    setTomMood("on-call")
    setLiveCall(mockLiveCall)
  }

  const endCall = () => {
    setTomState("wrap-up")
    setTomMood("thumbs-up")
    setTimeout(() => {
      setTomState("idle")
      setTomMood("welcoming")
      setLiveCall(null)
    }, 2000)
  }

  const handleTomCommand = (command: string) => {
    console.log("[v0] Tom command:", command)
    // In real app, send to Claude API
  }

  const quickCommandsByRole = {
    sharon: [
      { label: "Chase all overdue", command: "Chase all overdue invoices" },
      { label: "Weekly report", command: "Give me a money summary for this week" },
      { label: "Calculate wages", command: "Calculate Kevin's wages for approval" },
    ],
    andy: [
      { label: "Lower bids 10%", command: "Lower all antenna bids by 10%" },
      { label: "Find $99 pricing", command: "Find all pages showing $99 and tell me where" },
      { label: "Performance report", command: "How are the ads performing today?" },
    ],
    ross: [
      { label: "Book a job", command: "Book a job for..." },
      { label: "I'm at lunch", command: "Put Tom on first ring, I'm at lunch" },
      { label: "Pause Tom", command: "Pause Tom for 30 minutes" },
    ],
    steve: [
      { label: "Send Monday jobs", command: "Send all techs their Monday jobs" },
      { label: "Any dramas?", command: "What problems do I need to know about?" },
      { label: "Assign Padbury", command: "Assign that Padbury job to Dave" },
    ],
    tech: [
      { label: "Next job details", command: "Tell me about my next job" },
      { label: "Running late", command: "Let the customer know I'm running 15 min late" },
      { label: "Call office", command: "Connect me to Steve" },
    ],
  }

  const renderDashboard = () => {
    switch (currentRole) {
      case "andy":
        return <AndyDashboard />
      case "sharon":
        return <SharonDashboard />
      case "ross":
        return <RossDashboard />
      case "steve":
        return <SteveDashboard />
      case "tech":
        return <TechDashboard />
      default:
        return <SharonDashboard />
    }
  }

  const tomAvatars = {
    welcoming:
      "/images/u9681566679-cartoon-illustration-of-a-friendly-older-man-with-0d9acd05-07b9-495d-9ce2-25acf85f6900-0.png",
    "thumbs-up":
      "/images/u9681566679-cartoon-older-man-with-grey-beard-glasses-headset-f26c9a04-7907-42c5-90b8-3c831131f866-3.png",
    thoughtful:
      "/images/u9681566679-cartoon-portrait-of-friendly-older-man-with-grey-b98f39fd-298d-49cc-9bad-e86e2a9d851d-3.png",
    smirk:
      "/images/u9681566679-friendly-cartoon-older-man-grey-beard-glasses-hea-30802611-b63c-4962-b6e0-c129bf5b9d89-3.png",
    "on-call": "/images/u9681566679-httpss.png",
    concerned:
      "/images/u9681566679-friendly-cartoon-face-portrait-of-an-older-man-wi-b5ba9f6a-0cfc-49f1-b97e-db7f63e98c27-1.png",
  }

  const greeting = tomGreetings[currentRole]?.[0] || "G'day! Ready to help."

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onSimulateCall={simulateCall}
        tomState={tomState}
      />

      {/* System Status Bar */}
      <SystemStatusBar />

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 p-4 md:p-6">
        {/* Left Column - Dashboard Content */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-900/20 to-slate-900 border border-amber-800/50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="relative group">
                <TomAvatar
                  src={tomAvatars[tomMood] || "/placeholder.svg"}
                  size={80}
                  outfit={tomOutfit}
                  onClick={() => setShowClothingPicker(!showClothingPicker)}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-800 border border-amber-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setShowClothingPicker(!showClothingPicker)}
                >
                  <Shirt className="w-3 h-3 text-amber-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white mb-1">
                  {currentRole === "sharon"
                    ? "Morning Sharon!"
                    : currentRole === "andy"
                      ? "G'day Andy!"
                      : currentRole === "steve"
                        ? "Morning Steve!"
                        : currentRole === "ross"
                          ? "Hey Ross!"
                          : "G'day mate!"}
                </h2>
                <p className="text-slate-200 leading-relaxed">{greeting}</p>

                {/* Stats inline */}
                <div className="flex gap-4 mt-3 text-sm text-slate-400">
                  <span>
                    <Phone className="w-3 h-3 inline mr-1" />
                    {mockTomStats.callsToday} calls today
                  </span>
                  <span>
                    <MessageSquare className="w-3 h-3 inline mr-1" />
                    {mockTomStats.bookingsToday} bookings
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clothing Picker */}
          {showClothingPicker && (
            <TomClothingPicker
              outfit={tomOutfit}
              onOutfitChange={setTomOutfit}
              onClose={() => setShowClothingPicker(false)}
            />
          )}

          {/* Role-specific dashboard below Tom's greeting */}
          {renderDashboard()}
        </div>

        {/* Right Column - Tom Supervision Layer */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:h-screen lg:overflow-y-auto lg:pb-6">
          {/* Tom Status Panel */}
          <TomStatusPanel
            state={tomState}
            mood={tomMood}
            outfit={tomOutfit}
            liveCall={liveCall}
            onListenIn={() => console.log("[v0] Listen in")}
            onWhisper={(msg) => console.log("[v0] Whisper:", msg)}
            onTakeOver={() => endCall()}
          />

          {/* Perth Weather - 3 Day Forecast */}
          <WeatherWidget />

          {/* Talk to Fish - LIVE */}
          <TalkToTomLive
            currentRole={currentRole}
            quickCommands={quickCommandsByRole[currentRole]}
            onActivity={handleNewActivity}
          />

          {/* Tom's Activity Feed - LIVE */}
          <TomActivityFeed activities={liveActivities.length > 0 ? liveActivities : createTomActivities()} />
        </div>
      </div>
    </div>
  )
}
