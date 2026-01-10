import type {
  LiveCall,
  TomStats,
  QueueItem,
  SharonStats,
  AndyStats,
  LeadSource,
  RossInboxItem,
  Tech,
  ScheduledJob,
  TechJob,
} from "./types"

// ============================================================
// ⚠️ ALL DATA IN THIS FILE IS MOCK/PLACEHOLDER DATA ⚠️
// This is NOT connected to real APIs (Ascora, MYOB, Google Ads, etc.)
// Wire up real integrations via Fish API to replace this dummy data
// ============================================================

// === TOM WIDGET DATA ===
export const mockLiveCall: LiveCall = {
  id: "call-1",
  customerName: "Mrs Chen",
  customerPhone: "0412 345 678",
  customerContext: "Previous job Dec 15 - TV Antenna. Dog's name is Biscuit.",
  callType: "Inbound - Antenna Quote",
  duration: "2:34",
  sentiment: "positive",
  transcript: [
    { speaker: "tom", text: "G'day, Tom speaking from Perth Antennas. How can I help ya?" },
    {
      speaker: "customer",
      text: "Yeah g'day, I need someone to look at me antenna. Reception's been dodgy since the storm.",
    },
    { speaker: "tom", text: "No worries mate, whereabouts are ya?" },
    { speaker: "customer", text: "Joondalup, just off Wanneroo Road." },
    { speaker: "tom", text: "Beauty, we service that area. I can get someone out tomorrow arvo, would 2pm work?" },
  ],
}

export const mockTomStats: TomStats = {
  callsToday: 14,
  bookingsToday: 8,
  missedCalls: 1,
  avgCallTime: "2:12",
}

// === SHARON DASHBOARD DATA ===
// NOTE: ALL VALUES BELOW ARE MOCK/PLACEHOLDER DATA
export const mockSharonStats: SharonStats = {
  outstanding: 12450, // PLACEHOLDER
  overdue: 4230, // PLACEHOLDER
  collectedToday: 1850, // PLACEHOLDER
  tomChasing: 6, // PLACEHOLDER
}

export const mockQueueItems: QueueItem[] = [
  {
    id: "1",
    customerName: "[MOCK] Smith, John",
    type: "overdue-invoice",
    priority: "high",
    summary: "Invoice #1234 - 14 days overdue (PLACEHOLDER)",
    amount: 450,
    tomContext: "Called twice, no answer. Left voicemail yesterday.",
  },
  {
    id: "2",
    customerName: "Chen, Margaret",
    type: "callback",
    priority: "high",
    summary: "Requested callback about commercial quote",
    tomContext: "Wants to discuss bulk discount for 4 antenna installs.",
  },
  {
    id: "3",
    customerName: "Jones, Terry",
    type: "overdue-invoice",
    priority: "medium",
    summary: "Invoice #1198 - 8 days overdue",
    amount: 320,
    tomContext: "Promised to pay Friday. Following up.",
  },
  {
    id: "4",
    customerName: "Patterson, Dave",
    type: "quote-followup",
    priority: "medium",
    summary: "Quote #Q-445 sent 5 days ago",
    amount: 1200,
    tomContext: "Sent quote for full house rewire. No response yet.",
  },
  {
    id: "5",
    customerName: "Brown, Karen",
    type: "callback",
    priority: "low",
    summary: "General enquiry about service areas",
  },
  {
    id: "6",
    customerName: "Williams, Steve",
    type: "quote-followup",
    priority: "low",
    summary: "Quote #Q-441 sent 3 days ago",
    amount: 380,
  },
]

// === ANDY DASHBOARD DATA ===
// NOTE: ALL VALUES BELOW ARE MOCK/PLACEHOLDER DATA
export const mockAndyStats: AndyStats = {
  leadsThisWeek: 47, // PLACEHOLDER
  leadsChange: 12, // PLACEHOLDER
  conversionRate: 68, // PLACEHOLDER
  conversionChange: 5, // PLACEHOLDER
  avgJobValue: 285, // PLACEHOLDER
  avgJobChange: 23, // PLACEHOLDER
  tomCallsToday: 14, // PLACEHOLDER
  tomBookings: 8, // PLACEHOLDER
  tomAnswerRate: 94, // PLACEHOLDER
  tomBookingRate: 57, // PLACEHOLDER
  avgCallDuration: "2:12", // PLACEHOLDER
  missedCalls: 1, // PLACEHOLDER
}

export const mockLeadSources: LeadSource[] = [
  { name: "Google Ads", leads: 28, percentage: 45, revenue: 8420 },
  { name: "Word of Mouth", leads: 15, percentage: 24, revenue: 4650 },
  { name: "Facebook", leads: 12, percentage: 19, revenue: 3200 },
  { name: "Website Direct", leads: 7, percentage: 12, revenue: 1890 },
]

// === ROSS DASHBOARD DATA ===
export const mockRossInbox: RossInboxItem[] = [
  {
    id: "1",
    type: "escalation",
    from: "Tom (AI)",
    subject: "Customer wants 20% discount",
    preview: "Mrs Chen asking for neighbour's discount. Above my pay grade, boss.",
    time: "10:23am",
    tomSummary: "She mentioned her neighbour got a deal. I said I'd check with the boss.",
  },
  {
    id: "2",
    type: "voicemail",
    from: "Unknown (0456 789 012)",
    subject: "Angry customer - no show",
    preview: "I've been waiting all morning and nobody showed up...",
    time: "9:12am",
    tomSummary: "Sounds upset. Job was scheduled for 9am but AJ is running late in Joondalup.",
  },
  {
    id: "3",
    type: "escalation",
    from: "Tom (AI)",
    subject: "Can't book - all techs full Thursday",
    preview: "Customer insists on Thursday PM but everyone's booked.",
    time: "8:55am",
    tomSummary: "Next available is Friday 10am. Customer wasn't happy about it.",
  },
  {
    id: "4",
    type: "email",
    from: "accounts@wholesalesupply.com.au",
    subject: "RE: Bulk antenna order",
    preview: "Thanks for your enquiry. We can offer 15% on orders over...",
    time: "8:30am",
  },
  {
    id: "5",
    type: "voicemail",
    from: "Mr Patterson (0478 901 234)",
    subject: "Commercial job discussion",
    preview: "Hi, it's Dave Patterson. I got your quote and wanted to...",
    time: "Yesterday",
  },
  {
    id: "6",
    type: "email",
    from: "Website Form",
    subject: "Invoice query - #1234",
    preview: "I received this invoice but I think there's an error...",
    time: "Yesterday",
  },
]

// === STEVE DASHBOARD DATA ===
export const mockTechs: Tech[] = [
  {
    id: "aj",
    name: "AJ",
    status: "on-job",
    currentLocation: "14 Murray St, Joondalup",
    currentJob: "Antenna replacement - Mrs Lee",
  },
  {
    id: "mick",
    name: "Mick",
    status: "travelling",
    currentLocation: "Heading to Hillarys",
    currentJob: "TV Mount - Mr Khan (next)",
  },
  {
    id: "tony",
    name: "Tony",
    status: "on-job",
    currentLocation: "27 Ocean Rd, Morley",
    currentJob: "Oven repair - Mrs Chen",
  },
  {
    id: "dave",
    name: "Dave",
    status: "available",
    currentLocation: "Depot",
  },
]

export const mockScheduledJobs: ScheduledJob[] = [
  {
    id: "1",
    time: "9:00",
    duration: "1.5 hrs",
    customerName: "Mrs Lee",
    address: "14 Murray St, Joondalup",
    jobType: "Antenna Replacement",
    techId: "aj",
    status: "in-progress",
    tomNotes: "Customer mentioned dog in backyard - use side gate.",
  },
  {
    id: "2",
    time: "11:00",
    duration: "1 hr",
    customerName: "Mr Khan",
    address: "8 Beach Rd, Hillarys",
    jobType: "TV Wall Mount",
    techId: "mick",
    status: "scheduled",
  },
  {
    id: "3",
    time: "10:30",
    duration: "2 hrs",
    customerName: "Mrs Chen",
    address: "27 Ocean Rd, Morley",
    jobType: "Oven Repair",
    techId: "tony",
    status: "in-progress",
    tomNotes: "Part already ordered - should be at depot.",
  },
  {
    id: "4",
    time: "1:00",
    duration: "1.5 hrs",
    customerName: "Mr Smith",
    address: "45 Park Ave, Scarborough",
    jobType: "Ceiling Fan Install",
    techId: "aj",
    status: "scheduled",
  },
  {
    id: "5",
    time: "2:30",
    duration: "1 hr",
    customerName: "Mrs Brown",
    address: "12 Lake St, Karrinyup",
    jobType: "Power Point Install",
    techId: "mick",
    status: "scheduled",
    tomNotes: "Customer works from home - call before arriving.",
  },
  {
    id: "6",
    time: "3:30",
    duration: "1.5 hrs",
    customerName: "Mr Davies",
    address: "33 Hill Rd, Padbury",
    jobType: "Antenna + TV Setup",
    techId: null,
    status: "unassigned",
  },
]

// === TECH (FIELD) DASHBOARD DATA ===
export const mockTechJobs: TechJob[] = [
  {
    id: "1",
    time: "10:30",
    customerName: "Mrs Chen",
    address: "27 Ocean Rd, Morley",
    jobType: "Oven Repair - Element Replacement",
    tomNotes: "Part at depot. Customer has a cat named Whiskers. Prefers you call before arriving.",
    status: "current",
  },
  {
    id: "2",
    time: "1:00",
    customerName: "Mr Smith",
    address: "45 Park Ave, Scarborough",
    jobType: "Ceiling Fan Installation x2",
    tomNotes: "Two fans - lounge and master bedroom. Has ladder if needed.",
    status: "next",
  },
  {
    id: "3",
    time: "3:00",
    customerName: "Mrs Patterson",
    address: "18 Coast Hwy, Trigg",
    jobType: "Antenna Signal Check",
    status: "scheduled",
  },
]

// === ROLE-SPECIFIC TOM DATA ===
export const tomGreetings = {
  sharon: [
    "Morning Sharon! Got $4,230 outstanding - David Chen's the worst offender at 14 days. Want me to give him a nudge?",
    "Sharon! Collected $1,850 already today. Not bad for a Monday. Still chasing 6 invoices though.",
    "G'day Sharon! Just had a chat with John Smith - he reckons he'll pay Friday. Heard that before... 🙄",
  ],
  andy: [
    "Morning Andy! 47 leads this week, up 12 on last. Google Ads are on fire mate - 28 leads at 45%.",
    "Andy! I've handled 14 calls today, booked 8 jobs. That's a 57% booking rate. Not too shabby eh?",
    "G'day boss! Your Facebook ads are pulling their weight - 12 leads at $267 per booking. Tell Sharon she owes me a beer.",
  ],
  ross: [
    "Morning Ross! Got 3 voicemails and 2 escalations for ya. Mrs Chen wants a discount - above my pay grade, mate.",
    "G'day Ross! Quiet arvo so far. Just one angry customer - AJ was late to a job in Joondalup. Classic AJ.",
    "Ross! I tried to book a customer for Thursday but everyone's chockers. They weren't happy. Might need your charm on this one.",
  ],
  steve: [
    "Morning Steve! AJ's on a job in Joondalup, Mick's heading to Hillarys, Tony's in Morley. Dave's at the depot twiddling his thumbs.",
    "G'day Steve! Tony texted - traffic's a nightmare, running 20 min late to Morley.",
    "Steve! Got 6 jobs today, one unassigned for 3:30pm in Padbury. Dave's available if you wanna send him.",
  ],
  tech: [
    "G'day mate! You're at Mrs Chen's in Morley. Part's at the depot. She's got a cat named Whiskers and prefers a call before you rock up.",
    "Yo! Current job is oven repair, next up is Mr Smith in Scarborough at 1pm. Two ceiling fans. Easy money.",
    "Mate! You've got 3 jobs today. Mrs Patterson's last - just a signal check in Trigg. Should be home by 4:30.",
  ],
} as const

export const tomRecentActivity = {
  sharon: [
    "Just called David Chen - voicemail again. That's twice today.",
    "Mrs Patterson paid her $320 invoice! Transferred just now.",
    "Chased Terry Jones - he promised Friday payment. Following up then.",
  ],
  andy: [
    "Booked a $450 antenna job from Google Ads. Joondalup area.",
    "Facebook lead converted - $380 TV mount in Hillarys for Wednesday.",
    "Missed one call at 9:12am - they didn't leave a message. Can't win 'em all.",
  ],
  ross: [
    "Escalated Mrs Chen's discount request - she wants 20% off. Your call, boss.",
    "Flagged an angry voicemail - customer waited all morning, AJ was late.",
    "Couldn't book Thursday PM slot - all techs full. Customer insisted though.",
  ],
  steve: [
    "Just assigned the Padbury job to Dave - he was free at 3:30pm.",
    "Tony texted - traffic's a nightmare, running 20 min late to Morley.",
    "AJ finished the Joondalup antenna early. Legend.",
  ],
  tech: [
    "Updated Mrs Chen's notes - she prefers a call 10 min before arrival.",
    "Added part location to your job - it's at the depot, grab it before you go.",
    "Mr Smith's expecting you at 1pm - he's got a ladder if you need it.",
  ],
} as const
