"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shirt, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TomOutfit, ClothingSlot } from "@/lib/types"
import { clothingItems, presetOutfits } from "@/lib/clothing-data"

interface TomClothingPickerProps {
  outfit: TomOutfit
  onOutfitChange: (outfit: TomOutfit) => void
  onClose: () => void
}

const slotLabels: Record<ClothingSlot, { label: string; icon: string }> = {
  hat: { label: "Headwear", icon: "🎩" },
  face: { label: "Face", icon: "👓" },
  body: { label: "Body", icon: "👔" },
  accessory: { label: "Accessory", icon: "✨" },
}

const slotOrder: ClothingSlot[] = ["hat", "face", "body", "accessory"]

export function TomClothingPicker({ outfit, onOutfitChange, onClose }: TomClothingPickerProps) {
  const [activeSlot, setActiveSlot] = useState<ClothingSlot>("hat")

  const itemsForSlot = clothingItems.filter((item) => item.slot === activeSlot)

  const toggleItem = (itemId: string, slot: ClothingSlot) => {
    const newOutfit = { ...outfit }
    if (newOutfit[slot] === itemId) {
      delete newOutfit[slot]
    } else {
      newOutfit[slot] = itemId
    }
    onOutfitChange(newOutfit)
  }

  const applyPreset = (preset: typeof presetOutfits[number]) => {
    onOutfitChange(preset.items as TomOutfit)
  }

  const clearAll = () => {
    onOutfitChange({})
  }

  const equippedCount = Object.values(outfit).filter(Boolean).length

  return (
    <Card className="bg-slate-900 border-amber-600/50">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Suit Up Tom</span>
            {equippedCount > 0 && (
              <Badge variant="outline" className="border-amber-600 text-amber-300 text-xs">
                {equippedCount} on
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {equippedCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAll}
                className="h-7 text-xs text-slate-400 hover:text-red-400"
              >
                Strip
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-7 w-7 p-0 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-1" />
          {presetOutfits.map((preset) => (
            <Button
              key={preset.name}
              size="sm"
              variant="outline"
              onClick={() => applyPreset(preset)}
              className="h-7 text-xs border-slate-700 bg-transparent text-slate-300 hover:border-amber-600 hover:text-amber-300"
            >
              {preset.name}
            </Button>
          ))}
        </div>

        {/* Slot Tabs */}
        <div className="flex gap-1 bg-slate-950 rounded-lg p-1">
          {slotOrder.map((slot) => (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium transition-colors",
                activeSlot === slot
                  ? "bg-amber-600/20 text-amber-300 border border-amber-600/40"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <span>{slotLabels[slot].icon}</span>
              <span className="hidden sm:inline">{slotLabels[slot].label}</span>
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-3 gap-2">
          {itemsForSlot.map((item) => {
            const isEquipped = outfit[item.slot] === item.id
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id, item.slot)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                  isEquipped
                    ? "border-amber-500 bg-amber-900/30 shadow-lg shadow-amber-900/20"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800"
                )}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className={cn("text-[10px]", isEquipped ? "text-amber-300" : "text-slate-400")}>
                  {item.name}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
