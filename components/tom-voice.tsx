"use client"

import { useState } from "react"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TomVoiceProps {
  onSimulateCall: () => void
}

export function TomVoice({ onSimulateCall }: TomVoiceProps) {
  const [isListening, setIsListening] = useState(false)

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Volume2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Talk to Tom</p>
            <p className="text-sm text-muted-foreground">
              {isListening ? "Listening... say something" : "Tap the mic to give Tom a command"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            className="h-14 w-14 rounded-full p-0"
            onClick={() => setIsListening(!isListening)}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            <span className="sr-only">{isListening ? "Stop listening" : "Start listening"}</span>
          </Button>

          {/* Demo button to simulate a call */}
          <Button size="lg" variant="outline" className="h-14 px-4 bg-transparent" onClick={onSimulateCall}>
            Demo: Incoming call
          </Button>
        </div>
      </div>
    </div>
  )
}
