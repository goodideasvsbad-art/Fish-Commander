"use client"

import { Mic, Circle } from "lucide-react"
import type { TomState } from "@/lib/types"

interface MobileTomButtonProps {
  tomState: TomState
  onClick: () => void
}

export function MobileTomButton({ tomState, onClick }: MobileTomButtonProps) {
  const isOnCall = tomState.status === "on_call"

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4">
      <button
        onClick={onClick}
        className={`flex h-14 w-full items-center justify-center gap-3 rounded-xl font-medium transition-colors ${
          isOnCall ? "bg-blue-500 text-white" : "bg-primary text-primary-foreground"
        }`}
      >
        {isOnCall ? (
          <>
            <Circle className="h-3 w-3 animate-pulse fill-current" />
            <span>View Live Call</span>
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" />
            <span>Talk to Tom</span>
          </>
        )}
      </button>
    </div>
  )
}
