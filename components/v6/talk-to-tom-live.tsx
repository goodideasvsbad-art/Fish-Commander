"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Send, Loader2, User, Bot, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  thinking?: string
  tools_used?: Array<{ tool: string; input: any; result: any }>
  timestamp: number
}

interface TalkToTomLiveProps {
  currentRole: string
  quickCommands?: { label: string; command: string }[]
  onActivity?: (activity: string) => void
}

const FISH_API_URL = "http://localhost:5055/api/fish/chat"

export function TalkToTomLive({ currentRole, quickCommands, onActivity }: TalkToTomLiveProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [command, setCommand] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!command.trim() || isProcessing) return

    const userMessage: Message = {
      role: "user",
      content: command.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCommand("")
    setIsProcessing(true)

    try {
      // Build message history for API
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch(FISH_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          user_profile: currentRole,
          show_thinking: showThinking,
          session_id: `commander_${currentRole}_${Date.now()}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "No response",
        thinking: data.thinking,
        tools_used: data.tools_used,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Send activity to feed
      if (onActivity && data.tools_used && data.tools_used.length > 0) {
        const toolNames = data.tools_used.map((t: any) => t.tool).join(", ")
        onActivity(`🔧 Tom used: ${toolNames}`)
      }
    } catch (error) {
      console.error("Fish API error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ Error connecting to Fish: ${error instanceof Error ? error.message : "Unknown error"}\n\nMake sure file_relay.py is running on port 5055.`,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceInput = () => {
    setIsListening(!isListening)
    // TODO: Integrate with Web Speech API or ElevenLabs
    alert("Voice input coming soon!")
  }

  const handleClearHistory = () => {
    if (confirm("Clear all messages?")) {
      setMessages([])
    }
  }

  return (
    <Card className="bg-gradient-to-br from-amber-900/30 to-slate-900 border-amber-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-amber-400" />
            Talk to Fish (LIVE)
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowThinking(!showThinking)}
              className="h-6 text-xs text-slate-400 hover:text-white"
            >
              {showThinking ? "Hide" : "Show"} Thinking
            </Button>
            {messages.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearHistory}
                className="h-6 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Message History */}
        {messages.length > 0 && (
          <div className="max-h-96 overflow-y-auto space-y-3 mb-3 border border-slate-800 rounded-lg p-3 bg-slate-950/50">
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <div
                  className={cn(
                    "flex gap-2 items-start",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "px-3 py-2 rounded-lg max-w-[85%] text-sm",
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Thinking */}
                {msg.thinking && showThinking && (
                  <div className="ml-8 text-xs text-slate-500 italic bg-slate-900/50 p-2 rounded border border-slate-800">
                    <span className="font-semibold">💭 Thinking:</span>{" "}
                    {msg.thinking.slice(0, 200)}
                    {msg.thinking.length > 200 && "..."}
                  </div>
                )}

                {/* Tools Used */}
                {msg.tools_used && msg.tools_used.length > 0 && (
                  <div className="ml-8 text-xs text-amber-400 flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    <span>
                      Used: {msg.tools_used.map((t) => t.tool).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isProcessing && handleSend()}
            placeholder={
              messages.length === 0
                ? "Ask Fish or give instructions..."
                : "Continue conversation..."
            }
            disabled={isProcessing}
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-600 disabled:opacity-50"
          />
          <Button
            size="sm"
            onClick={handleVoiceInput}
            variant="outline"
            className={cn(
              "border-amber-700 bg-amber-900/30",
              isListening && "bg-red-600 border-red-600 animate-pulse"
            )}
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
                disabled={isProcessing}
                className="h-7 text-xs border-amber-700/50 bg-amber-900/20 text-amber-200 hover:bg-amber-900/40 disabled:opacity-50"
              >
                {qc.label}
              </Button>
            ))}
          </div>
        )}

        {/* Connection Status */}
        {messages.length === 0 && (
          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              🐟 Connected to Fish API (Opus 4.5)
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Role: {currentRole} | Port: 5055
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
