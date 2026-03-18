// === USERS ===
export type UserRole = "andy" | "steve" | "sharon" | "ross" | "tech"

export interface User {
  id: string
  name: string
  role: UserRole
  avatar?: string
}

// === TOM CLOTHING ===
export type ClothingSlot = "hat" | "face" | "body" | "accessory"

export interface ClothingItem {
  id: string
  name: string
  slot: ClothingSlot
  emoji: string
  offset: { top?: string; left?: string; right?: string; bottom?: string }
  size: string
  rotation?: string
}

export interface TomOutfit {
  hat?: string    // ClothingItem id
  face?: string   // ClothingItem id
  body?: string   // ClothingItem id
  accessory?: string // ClothingItem id
}

// === TOM STATE ===
export type TomState = "idle" | "on-call" | "wrap-up" | "paused" | "error"

export type TomMood =
  | "welcoming" // Default greeting, warm smile
  | "thumbs-up" // Celebrations, jobs booked
  | "thoughtful" // Processing, considering
  | "smirk" // Taking the piss, roasting
  | "on-call" // Currently handling a call
  | "concerned" // Problems, escalations

// === LIVE CALL ===
export interface LiveCall {
  id: string
  customerName: string
  customerPhone: string
  customerContext?: string
  callType: string
  duration: string
  sentiment: "positive" | "neutral" | "negative"
  transcript: { speaker: "tom" | "customer"; text: string }[]
}

export interface TomStats {
  callsToday: number
  bookingsToday: number
  missedCalls: number
  avgCallTime: string
}

// === QUEUE ITEMS (Sharon) ===
export type QueueItemType = "overdue-invoice" | "callback" | "quote-followup" | "new-lead"

export interface QueueItem {
  id: string
  customerName: string
  type: QueueItemType
  priority: "high" | "medium" | "low"
  summary: string
  amount?: number
  tomContext?: string
}

// === SHARON STATS ===
export interface SharonStats {
  outstanding: number
  overdue: number
  collectedToday: number
  tomChasing: number
}

// === ANDY STATS ===
export interface AndyStats {
  leadsThisWeek: number
  leadsChange: number
  conversionRate: number
  conversionChange: number
  avgJobValue: number
  avgJobChange: number
  tomCallsToday: number
  tomBookings: number
  tomAnswerRate: number
  tomBookingRate: number
  avgCallDuration: string
  missedCalls: number
}

export interface LeadSource {
  name: string
  leads: number
  percentage: number
  revenue: number
}

// === ROSS INBOX ===
export interface RossInboxItem {
  id: string
  type: "escalation" | "voicemail" | "email"
  from: string
  subject: string
  preview: string
  time: string
  tomSummary?: string
}

// === STEVE - TECHS & JOBS ===
export interface Tech {
  id: string
  name: string
  status: "on-job" | "travelling" | "available" | "offline"
  currentLocation: string
  currentJob?: string
}

export interface ScheduledJob {
  id: string
  time: string
  duration: string
  customerName: string
  address: string
  jobType: string
  techId: string | null
  status: "in-progress" | "scheduled" | "completed" | "unassigned"
  tomNotes?: string
}

// === TECH (FIELD) VIEW ===
export interface TechJob {
  id: string
  time: string
  customerName: string
  address: string
  jobType: string
  tomNotes?: string
  status: "current" | "next" | "scheduled" | "completed"
}
