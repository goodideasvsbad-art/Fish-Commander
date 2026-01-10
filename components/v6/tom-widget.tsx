"use client"

import { useState } from "react"
import { Phone, PhoneOff, Mic, MicOff, ChevronUp, ChevronDown, User, Clock, Send, Volume2, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { TomState, LiveCall, TomStats } from "@/lib/types"

interface TomWidgetProps {
  tomState: TomState
  liveCall: LiveCall | null
  expanded: boolean
  onToggleExpand: () => void
  onEndCall: () => void
  stats: TomStats
}

const quickWhispers = ["Offer morning slot", "Check availability", "Get callback number", "Confirm address"]

export function TomWidget({ tomState, liveCall, expanded, onToggleExpand, onEndCall, stats }: TomWidgetProps) {
  const [whisperText, setWhisperText] = useState("")
  const [isMuted, setIsMuted] = useState(false)

  const isOnCall = tomState === "on-call" && liveCall

  const sendWhisper = (text: string) => {
    console.log("[v0] Whisper sent:", text)
    setWhisperText("")
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out",
        expanded ? "w-[420px]" : "w-auto",
      )}
    >
      {/* Expanded Panel */}
      {expanded && isOnCall && (
        <div className="bg-slate-900 border border-slate-700 rounded-t-xl shadow-2xl overflow-hidden mb-0 animate-in slide-in-from-bottom-2">
          {/* Call Header */}
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-b border-slate-700 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="font-semibold text-white">{liveCall.customerName}</p>
                  <p className="text-xs text-slate-400">{liveCall.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{liveCall.duration}</span>
                </div>
                <div
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    liveCall.sentiment === "positive"
                      ? "bg-green-900/50 text-green-300"
                      : liveCall.sentiment === "negative"
                        ? "bg-red-900/50 text-red-300"
                        : "bg-slate-700 text-slate-300",
                  )}
                >
                  {liveCall.sentiment}
                </div>
              </div>
            </div>

            {/* Customer Context */}
            {liveCall.customerContext && (
              <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-slate-300">
                <span className="text-slate-500">Context:</span> {liveCall.customerContext}
              </div>
            )}
          </div>

          {/* Live Transcript */}
          <div className="h-48 overflow-y-auto p-3 space-y-2 bg-slate-950/50">
            {liveCall.transcript.map((line, i) => (
              <div
                key={i}
                className={cn("flex gap-2 text-sm", line.speaker === "tom" ? "text-amber-300" : "text-slate-300")}
              >
                <span className="font-medium shrink-0">{line.speaker === "tom" ? "Tom:" : "Caller:"}</span>
                <span>{line.text}</span>
              </div>
            ))}
          </div>

          {/* Whisper Bar */}
          <div className="border-t border-slate-700 p-3 bg-slate-900">
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Whisper to Tom..."
                value={whisperText}
                onChange={(e) => setWhisperText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && whisperText && sendWhisper(whisperText)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button
                size="icon"
                onClick={() => whisperText && sendWhisper(whisperText)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Whisper Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickWhispers.map((whisper) => (
                <button
                  key={whisper}
                  onClick={() => sendWhisper(whisper)}
                  className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
                >
                  {whisper}
                </button>
              ))}
            </div>
          </div>

          {/* Call Controls */}
          <div className="border-t border-slate-700 p-3 bg-slate-900 flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsMuted(!isMuted)}
                className={cn("border-slate-600", isMuted && "bg-red-900/30 border-red-700 text-red-300")}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="outline" className="border-slate-600 bg-transparent">
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-amber-600 text-amber-400 hover:bg-amber-950 bg-transparent"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause Tom
              </Button>
              <Button size="sm" onClick={onEndCall} className="bg-red-600 hover:bg-red-700">
                <PhoneOff className="w-4 h-4 mr-1" />
                Take Over
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed/Idle Widget */}
      <div
        onClick={onToggleExpand}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all shadow-lg",
          isOnCall
            ? "bg-gradient-to-r from-green-900 to-emerald-900 border border-green-700"
            : "bg-slate-800 border border-slate-700 hover:bg-slate-750",
          expanded && isOnCall && "rounded-t-none border-t-0",
        )}
      >
        {/* Tom Avatar */}
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0",
            isOnCall ? "bg-green-800 ring-2 ring-green-500 ring-offset-2 ring-offset-slate-900" : "bg-slate-700",
          )}
        >
          {isOnCall ? <Phone className="w-6 h-6 text-green-300 animate-pulse" /> : <span>🎧</span>}
        </div>

        {/* Status Text */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{isOnCall ? `On call: ${liveCall.customerName}` : "Tom is ready"}</p>
          <p className="text-xs text-slate-400 truncate">
            {isOnCall
              ? `${liveCall.duration} • ${liveCall.callType}`
              : `${stats.callsToday} calls today • ${stats.bookingsToday} bookings`}
          </p>
        </div>

        {/* Expand/Collapse */}
        <div className="text-slate-400">
          {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </div>
    </div>
  )
}
