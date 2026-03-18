"use client"

import { MapPin, Phone, Clock, ChevronRight, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CurrentJob() {
  const currentJob = {
    id: "J-4521",
    customer: "Dave Chen",
    address: "14 Murray St, Joondalup",
    type: "Antenna Replacement",
    time: "2:00 PM",
    phone: "0412 345 678",
    tomNote: "Spoke to Dave at 9:14am. He'll be home after 2pm. Dog's name is Biscuit.",
  }

  const nextJob = {
    id: "J-4522",
    customer: "Sarah Mitchell",
    address: "27 Ocean Reef Rd, Ocean Reef",
    type: "Quote - New Install",
    time: "3:30 PM",
  }

  return (
    <div className="space-y-4">
      {/* Current Job Card */}
      <div className="overflow-hidden rounded-xl border-2 border-primary bg-card">
        <div className="bg-primary px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-foreground">CURRENT JOB</span>
            <span className="text-sm text-primary-foreground/80">{currentJob.id}</span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">{currentJob.customer}</h2>
              <p className="mt-1 text-lg text-muted-foreground">{currentJob.type}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{currentJob.time}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-foreground">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{currentJob.address}</span>
          </div>

          {/* Tom's Note */}
          <div className="mt-4 rounded-lg bg-accent/10 p-3">
            <p className="text-sm font-medium text-accent">Tom&apos;s note:</p>
            <p className="mt-1 text-sm text-foreground">{currentJob.tomNote}</p>
          </div>

          {/* Action Buttons - BIG for tradie fingers */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button size="lg" className="h-14 text-base font-semibold">
              <Navigation className="mr-2 h-5 w-5" />
              Navigate
            </Button>
            <Button size="lg" variant="outline" className="h-14 text-base font-semibold bg-transparent">
              <Phone className="mr-2 h-5 w-5" />
              Call Dave
            </Button>
          </div>
        </div>
      </div>

      {/* Next Job Preview */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">NEXT UP at {nextJob.time}</p>
            <p className="font-semibold text-foreground">{nextJob.customer}</p>
            <p className="text-sm text-muted-foreground">{nextJob.type}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  )
}
