"use client"

import { useState } from "react"
import { Mic, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TalkToTomProps {
  onCommand: (command: string) => void
  quickCommands?: { label: string; command: string }[]
  isProcessing?: boolean
}

export function TalkToTom({ onCommand, quickCommands, isProcessing = false }: TalkToTomProps) {
  const [command, setCommand] = useState("")
  const [isListening, setIsListening] = useState(false)

  const handleSend = () => {
    if (command.trim()) {
      onCommand(command)
      setCommand("")
    }
  }

  const handleVoiceInput = () => {
    setIsListening(!isListening)
    // In real app, integrate with Web Speech API or ElevenLabs
  }

  return (
    <Card className="bg-gradient-to-br from-amber-900/30 to-slate-900 border-amber-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-amber-400" />
          Talk to Tom
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isProcessing && handleSend()}
            placeholder="Ask Tom or give him instructions..."
            disabled={isProcessing}
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-600 disabled:opacity-50"
          />
          <Button
            size="sm"
            onClick={handleVoiceInput}
            variant="outline"
            className={cn("border-amber-700 bg-amber-900/30", isListening && "bg-red-600 border-red-600 animate-pulse")}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!command.trim() || isProcessing}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {/* Quick Commands */}
        {quickCommands && quickCommands.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {quickCommands.map((qc, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => setCommand(qc.command)}
                className="h-7 text-xs border-amber-700/50 bg-amber-900/20 text-amber-200 hover:bg-amber-900/40"
              >
                {qc.label}
              </Button>
            ))}
          </div>
        )}

        {/* ElevenLabs Widget Placeholder */}
        <div className="pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-500 mb-2">Or use voice (ElevenLabs):</p>
          <div className="w-full h-12 bg-slate-950 rounded border border-slate-800 flex items-center justify-center">
            <p className="text-xs text-slate-600">ElevenLabs widget will load here</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
