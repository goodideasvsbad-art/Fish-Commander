import type { ClothingItem } from "./types"

export const clothingItems: ClothingItem[] = [
  // === HATS ===
  { id: "hardhat", name: "Hard Hat", slot: "hat", emoji: "⛑️", offset: { top: "-14%", left: "50%" }, size: "45%", rotation: "-5deg" },
  { id: "crown", name: "Crown", slot: "hat", emoji: "👑", offset: { top: "-16%", left: "50%" }, size: "40%", rotation: "0deg" },
  { id: "cowboy", name: "Cowboy Hat", slot: "hat", emoji: "🤠", offset: { top: "-20%", left: "50%" }, size: "55%", rotation: "0deg" },
  { id: "tophat", name: "Top Hat", slot: "hat", emoji: "🎩", offset: { top: "-22%", left: "50%" }, size: "40%", rotation: "-5deg" },
  { id: "santa", name: "Santa Hat", slot: "hat", emoji: "🎅", offset: { top: "-16%", left: "50%" }, size: "42%", rotation: "0deg" },
  { id: "cap", name: "Cap", slot: "hat", emoji: "🧢", offset: { top: "-12%", left: "50%" }, size: "42%", rotation: "-8deg" },

  // === FACE ===
  { id: "sunnies", name: "Sunnies", slot: "face", emoji: "😎", offset: { top: "25%", left: "50%" }, size: "50%", rotation: "0deg" },
  { id: "monocle", name: "Monocle", slot: "face", emoji: "🧐", offset: { top: "22%", left: "60%" }, size: "30%", rotation: "0deg" },
  { id: "clown", name: "Clown Nose", slot: "face", emoji: "🔴", offset: { top: "42%", left: "50%" }, size: "18%", rotation: "0deg" },
  { id: "mask", name: "Mask", slot: "face", emoji: "🎭", offset: { top: "28%", left: "50%" }, size: "40%", rotation: "0deg" },

  // === BODY ===
  { id: "hivis", name: "Hi-Vis Vest", slot: "body", emoji: "🦺", offset: { bottom: "-5%", left: "50%" }, size: "50%", rotation: "0deg" },
  { id: "cape", name: "Cape", slot: "body", emoji: "🦸", offset: { top: "20%", right: "-15%" }, size: "45%", rotation: "15deg" },
  { id: "medal", name: "Medal", slot: "body", emoji: "🏅", offset: { bottom: "5%", left: "35%" }, size: "25%", rotation: "0deg" },
  { id: "tie", name: "Tie", slot: "body", emoji: "👔", offset: { bottom: "-2%", left: "50%" }, size: "30%", rotation: "0deg" },

  // === ACCESSORIES ===
  { id: "beer", name: "Cold One", slot: "accessory", emoji: "🍺", offset: { bottom: "0%", right: "-20%" }, size: "35%", rotation: "15deg" },
  { id: "coffee", name: "Coffee", slot: "accessory", emoji: "☕", offset: { bottom: "0%", right: "-18%" }, size: "30%", rotation: "10deg" },
  { id: "wrench", name: "Wrench", slot: "accessory", emoji: "🔧", offset: { bottom: "5%", left: "-15%" }, size: "30%", rotation: "-30deg" },
  { id: "flag", name: "Aussie Flag", slot: "accessory", emoji: "🇦🇺", offset: { top: "-5%", right: "-20%" }, size: "30%", rotation: "15deg" },
  { id: "parrot", name: "Parrot", slot: "accessory", emoji: "🦜", offset: { top: "0%", right: "-15%" }, size: "30%", rotation: "0deg" },
  { id: "fish", name: "Fish", slot: "accessory", emoji: "🐟", offset: { top: "-5%", left: "-15%" }, size: "28%", rotation: "-20deg" },
]

export const presetOutfits: { name: string; items: Record<string, string> }[] = [
  { name: "Tradie Tom", items: { hat: "hardhat", body: "hivis", accessory: "coffee" } },
  { name: "King Tom", items: { hat: "crown", body: "cape", face: "monocle" } },
  { name: "Party Tom", items: { hat: "cowboy", face: "sunnies", accessory: "beer" } },
  { name: "Xmas Tom", items: { hat: "santa", body: "medal", accessory: "beer" } },
  { name: "Fancy Tom", items: { hat: "tophat", face: "monocle", body: "tie" } },
  { name: "Pirate Tom", items: { hat: "cap", accessory: "parrot", face: "mask" } },
]
