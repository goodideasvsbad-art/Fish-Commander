"use client"

import { useState, useEffect, useRef } from "react"
import { Phone, Mic, MicOff, PhoneOff, MessageSquare, Headphones, ThumbsUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TomState, TomMood, LiveCall } from "@/lib/types"
import Image from "next/image"

interface TomStatusPanelProps {
  state: TomState
  mood: TomMood
  liveCall?: LiveCall
  onListenIn?: () => void
  onWhisper?: (message: string) => void
  onTakeOver?: () => void
}

export function TomStatusPanel({ state, mood, liveCall, onListenIn, onWhisper, onTakeOver }: TomStatusPanelProps) {
  const [whisperText, setWhisperText] = useState("")
  const [muted, setMuted] = useState(false)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [liveCall?.transcript])

  // Tom's avatar based on mood
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

  const handleWhisper = () => {
    if (whisperText.trim() && onWhisper) {
      onWhisper(whisperText)
      setWhisperText("")
    }
  }

  if (state === "idle") {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Image
              src={tomAvatars[mood] || "/placeholder.svg"}
              alt="Tom"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Tom is ready</p>
              <p className="text-xs text-slate-400">Waiting for calls</p>
            </div>
            <Badge variant="outline" className="border-green-700 text-green-300">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse" />
              Ready
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === "on-call" && liveCall) {
    return (
      <Card className="bg-slate-900 border-amber-600">
        <CardContent className="p-4 space-y-4">
          {/* Call Header */}
          <div className="flex items-start gap-3">
            <div className="relative">
              <Image
                src={tomAvatars["on-call"] || "/placeholder.svg"}
                alt="Tom on call"
                width={56}
                height={56}
                className="rounded-full"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center border-2 border-slate-900">
                <Phone className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{liveCall.customerName}</p>
              <p className="text-xs text-slate-400">{liveCall.callType}</p>
              {liveCall.customerContext && <p className="text-xs text-amber-300 mt-1">{liveCall.customerContext}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-white">{liveCall.duration}</p>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs mt-1",
                  liveCall.sentiment === "positive"
                    ? "border-green-700 text-green-300"
                    : liveCall.sentiment === "negative"
                      ? "border-red-700 text-red-300"
                      : "border-slate-600 text-slate-300",
                )}
              >
                {liveCall.sentiment}
              </Badge>
            </div>
          </div>

          {/* Live Transcript */}
          <div className="bg-slate-950 rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
            {liveCall.transcript.map((line, idx) => (
              <div key={idx} className={cn("text-sm", line.speaker === "tom" ? "text-amber-300" : "text-slate-300")}>
                <span className="font-medium">{line.speaker === "tom" ? "Tom" : "Customer"}:</span> {line.text}
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          {/* Whisper Bar */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={whisperText}
                onChange={(e) => setWhisperText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleWhisper()}
                placeholder="Whisper to Tom... (he'll hear it, customer won't)"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-600"
              />
              <Button size="sm" onClick={handleWhisper} className="bg-amber-600 hover:bg-amber-700">
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Send
              </Button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-slate-700 bg-transparent text-slate-300"
                onClick={() => setWhisperText("Ask for the address")}
              >
                Ask address
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-slate-700 bg-transparent text-slate-300"
                onClick={() => setWhisperText("Offer tomorrow 2pm")}
              >
                Tomorrow 2pm
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-slate-700 bg-transparent text-slate-300"
                onClick={() => setWhisperText("Transfer to Steve")}
              >
                Transfer
              </Button>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <Button
              size="sm"
              variant="outline"
              onClick={onListenIn}
              className="flex-1 border-blue-700 text-blue-300 bg-blue-900/20 hover:bg-blue-900/40"
            >
              <Headphones className="w-4 h-4 mr-1.5" />
              Listen In
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMuted(!muted)}
              className={cn("border-slate-700 text-slate-300 bg-transparent", muted && "border-red-700 text-red-300")}
            >
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onTakeOver}
              className="flex-1 border-red-700 text-red-300 bg-red-900/20 hover:bg-red-900/40"
            >
              <PhoneOff className="w-4 h-4 mr-1.5" />
              Take Over
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === "wrap-up") {
    return (
      <Card className="bg-slate-900 border-green-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Image
              src={tomAvatars["thumbs-up"] || "/placeholder.svg"}
              alt="Tom"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-white flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-400" />
                Call finished
              </p>
              <p className="text-xs text-slate-400">Tom is updating the system...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === "error") {
    return (
      <Card className="bg-red-900/20 border-red-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Image
              src={tomAvatars["concerned"] || "/placeholder.svg"}
              alt="Tom"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Tom has a problem
              </p>
              <p className="text-xs text-red-400">Check the logs or restart him</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
