"use client"

import { useState, useEffect } from "react"
import { Phone, PhoneOff, Volume2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LiveCallProps {
  onEndCall: () => void
}

export function LiveCall({ onEndCall }: LiveCallProps) {
  const [whisperText, setWhisperText] = useState("")
  const [callDuration, setCallDuration] = useState(0)

  // Simulated transcript
  const transcript = [
    {
      speaker: "customer",
      text: "Hi, I'm calling about my TV reception. It's been really patchy since that storm last week.",
    },
    {
      speaker: "tom",
      text: "G'day! Sorry to hear about the reception troubles. Storms can definitely knock antennas around. Are you getting any channels at all, or is it completely out?",
    },
    {
      speaker: "customer",
      text: "Some channels work okay, but ABC and SBS are really fuzzy. The kids are driving me nuts because Bluey keeps cutting out!",
    },
    {
      speaker: "tom",
      text: "Ha! Can't have Bluey going fuzzy, that's a household emergency! Sounds like your antenna might need realignment. I can get one of our techs out tomorrow arvo to have a look. Would 2pm work for you?",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((d) => d + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleWhisper = () => {
    if (whisperText.trim()) {
      // Would send whisper to Tom
      setWhisperText("")
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border-2 border-accent bg-card">
      {/* Call Header */}
      <div className="flex items-center justify-between bg-accent px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Phone className="h-5 w-5 text-accent-foreground" />
            <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-white" />
          </div>
          <div>
            <p className="font-semibold text-accent-foreground">Tom is talking to Greg Mitchell</p>
            <p className="text-sm text-accent-foreground/80">Morley area - Reception issues</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-lg text-accent-foreground">{formatDuration(callDuration)}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onEndCall}
            className="bg-white/20 text-accent-foreground hover:bg-white/30"
          >
            <PhoneOff className="mr-1.5 h-4 w-4" />
            End call
          </Button>
        </div>
      </div>

      {/* Transcript */}
      <div className="max-h-64 overflow-y-auto p-4">
        <div className="space-y-3">
          {transcript.map((line, i) => (
            <div key={i} className={`flex ${line.speaker === "tom" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  line.speaker === "tom" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{line.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Whisper Input */}
      <div className="border-t border-border bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Whisper to Tom (only he can hear)..."
            value={whisperText}
            onChange={(e) => setWhisperText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleWhisper()}
            className="flex-1"
          />
          <Button onClick={handleWhisper} disabled={!whisperText.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send whisper</span>
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Type a message to coach Tom during the call. The customer won&apos;t hear it.
        </p>
      </div>
    </div>
  )
}
