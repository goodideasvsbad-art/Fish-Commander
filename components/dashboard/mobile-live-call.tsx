"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Smile, Meh, Frown, PhoneOff, UserCheck, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CurrentCall, User } from "@/lib/types"

interface MobileLiveCallProps {
  call: CurrentCall
  user: User
  onAction: (action: string) => void
  onEndCall: () => void
  onBack: () => void
}

const quickPrompts = [
  { label: "Address", whisper: "Ask for the street address" },
  { label: "Suburb", whisper: "Confirm the suburb" },
  { label: "Confirm", whisper: "Confirm the booking details" },
]

export function MobileLiveCall({ call, user, onAction, onEndCall, onBack }: MobileLiveCallProps) {
  const [whisperText, setWhisperText] = useState("")
  const [callDuration, setCallDuration] = useState(0)
  const transcriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - call.startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [call.startTime])

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [call.transcript])

  const minutes = Math.floor(callDuration / 60)
  const seconds = callDuration % 60

  const getSentimentIcon = () => {
    switch (call.sentiment) {
      case "happy":
        return <Smile className="h-5 w-5 text-green-500" />
      case "frustrated":
        return <Frown className="h-5 w-5 text-red-500" />
      default:
        return <Meh className="h-5 w-5 text-amber-500" />
    }
  }

  const handleWhisper = (text: string) => {
    onAction(`Whispered: "${text}"`)
    setWhisperText("")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-blue-50 px-4 py-3 dark:bg-blue-950">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Queue</span>
        </button>
        <div className="text-center">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-700 dark:text-blue-300">Live</span>
            <span className="font-mono text-sm">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{call.callerPhone}</span>
        </div>
        {getSentimentIcon()}
      </header>

      {/* Call info */}
      <div className="border-b border-border bg-card px-4 py-2 text-sm">
        <span className="text-muted-foreground">Service:</span> {call.service} |{" "}
        <span className="text-muted-foreground">Suburb:</span> {call.suburb}
      </div>

      {/* Transcript */}
      <div ref={transcriptRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {call.transcript.map((line, i) => (
          <div key={i} className={`flex ${line.speaker === "tom" ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                line.speaker === "tom"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <div className="mb-1 text-xs font-medium opacity-70">{line.speaker === "tom" ? "Tom" : "Customer"}</div>
              <p className="text-sm">{line.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Whisper + actions */}
      {user.defaults.canWhisper && (
        <div className="border-t border-border bg-card p-4">
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={whisperText}
              onChange={(e) => setWhisperText(e.target.value)}
              placeholder="Whisper to Tom..."
              className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && whisperText.trim()) {
                  handleWhisper(whisperText)
                }
              }}
            />
            <Button size="icon" className="h-10 w-10" onClick={() => whisperText.trim() && handleWhisper(whisperText)}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4 flex gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt.label}
                onClick={() => handleWhisper(prompt.whisper)}
                className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-12 gap-2 bg-transparent"
              onClick={() => onAction("Taking over call")}
            >
              <UserCheck className="h-4 w-4" />
              Take Over
            </Button>
            <Button variant="destructive" className="h-12 gap-2" onClick={onEndCall}>
              <PhoneOff className="h-4 w-4" />
              End
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
