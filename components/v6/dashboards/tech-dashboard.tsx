"use client"

import { useState } from "react"
import {
  Navigation,
  Phone,
  MessageSquare,
  MapPin,
  Wrench,
  ChevronDown,
  ChevronUp,
  Camera,
  FileText,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { mockTechJobs } from "@/lib/mock-data"

export function TechDashboard() {
  const [showMap, setShowMap] = useState(false)
  const currentJob = mockTechJobs[0]
  const nextJob = mockTechJobs[1]

  return (
    <div className="p-4 space-y-4 pb-32 max-w-lg mx-auto">
      {/* Current Job - Big Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-amber-600 border-2">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-amber-600 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-950">CURRENT JOB</span>
              <span className="text-sm text-amber-950">{currentJob.time}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">{currentJob.customerName}</h2>
              <p className="text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {currentJob.address}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">{currentJob.jobType}</span>
            </div>

            {/* Tom's Notes */}
            {currentJob.tomNotes && (
              <div className="p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
                <p className="text-sm text-amber-200">
                  <span className="font-medium">Tom says:</span> {currentJob.tomNotes}
                </p>
              </div>
            )}

            {/* Big Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" className="h-14 bg-blue-600 hover:bg-blue-700 text-lg font-semibold">
                <Navigation className="w-5 h-5 mr-2" />
                Navigate
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 border-slate-600 text-lg font-semibold text-slate-200 bg-transparent"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 bg-transparent">
                <MessageSquare className="w-4 h-4 mr-1" />
                Running Late
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 bg-transparent">
                <Camera className="w-4 h-4 mr-1" />
                Photo
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 bg-transparent">
                <FileText className="w-4 h-4 mr-1" />
                Notes
              </Button>
            </div>

            {/* Map Toggle */}
            <Button variant="ghost" className="w-full text-slate-400" onClick={() => setShowMap(!showMap)}>
              {showMap ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Hide Map
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show Map
                </>
              )}
            </Button>

            {showMap && (
              <div className="h-48 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                Map placeholder
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Complete Job Button */}
      <Button size="lg" className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-semibold">
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Mark Job Complete
      </Button>

      {/* Next Job - Smaller Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-wide">Next Up</span>
            <span className="text-sm text-slate-400">{nextJob.time}</span>
          </div>
          <p className="font-medium text-white">{nextJob.customerName}</p>
          <p className="text-sm text-slate-400">{nextJob.address}</p>
          <p className="text-sm text-slate-500 mt-1">{nextJob.jobType}</p>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div className="flex items-center justify-around py-3 bg-slate-900 rounded-lg border border-slate-800">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-xs text-slate-500">Jobs left</p>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">2</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-400">5:30</p>
          <p className="text-xs text-slate-500">Est. finish</p>
        </div>
      </div>
    </div>
  )
}
