"use client"

import Image from "next/image"
import type { TomOutfit, ClothingItem } from "@/lib/types"
import { clothingItems } from "@/lib/clothing-data"

interface TomAvatarProps {
  src: string
  size?: number
  outfit?: TomOutfit
  className?: string
  onClick?: () => void
}

function getClothingItem(id: string): ClothingItem | undefined {
  return clothingItems.find((item) => item.id === id)
}

function ClothingOverlay({ item, avatarSize }: { item: ClothingItem; avatarSize: number }) {
  const fontSize = `${(parseFloat(item.size) / 100) * avatarSize}px`

  const style: React.CSSProperties = {
    position: "absolute",
    fontSize,
    lineHeight: 1,
    transform: `translate(-50%, -50%) rotate(${item.rotation || "0deg"})`,
    pointerEvents: "none",
    zIndex: 10,
    filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.5))",
  }

  // Position based on offset
  if (item.offset.top) style.top = item.offset.top
  if (item.offset.bottom) style.bottom = item.offset.bottom
  if (item.offset.left) style.left = item.offset.left
  if (item.offset.right) style.right = item.offset.right

  // Fix transform for items with left/right centering
  if (item.offset.left === "50%") {
    style.transform = `translateX(-50%) rotate(${item.rotation || "0deg"})`
  } else if (item.offset.right) {
    style.transform = `rotate(${item.rotation || "0deg"})`
  }

  return <span style={style}>{item.emoji}</span>
}

export function TomAvatar({ src, size = 80, outfit, className = "", onClick }: TomAvatarProps) {
  const slots = outfit ? Object.entries(outfit) : []

  return (
    <div
      className={`relative inline-block ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""} ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt="Tom"
        width={size}
        height={size}
        className="rounded-full border-2 border-amber-600"
      />
      {slots.map(([slot, itemId]) => {
        if (!itemId) return null
        const item = getClothingItem(itemId)
        if (!item) return null
        return <ClothingOverlay key={slot} item={item} avatarSize={size} />
      })}
    </div>
  )
}
