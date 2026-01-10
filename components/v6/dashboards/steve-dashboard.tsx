"use client"

import { useState, useEffect } from "react"
import { MapPin, User, Clock, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { mockTechs, mockScheduledJobs } from "@/lib/mock-data"

const API_URL = "http://localhost:5055/api/dashboard/steve"

export function SteveDashboard() {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [techs, setTechs] = useState(mockTechs)
  const [scheduledJobs, setScheduledJobs] = useState(mockScheduledJobs)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error(`API error: ${response.status}`)
        const data = await response.json()

        if (data.techs && Array.isArray(data.techs)) {
          setTechs(data.techs)
        }

        if (data.scheduledJobs && Array.isArray(data.scheduledJobs)) {
          setScheduledJobs(data.scheduledJobs)
        }
      } catch (err) {
        console.error("Failed to fetch Steve's data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredJobs = selectedTech ? scheduledJobs.filter((j) => j.techId === selectedTech) : scheduledJobs

  return (
    <div className="p-4 md:p-6 pb-24">
      {loading && (
        <Card className="bg-blue-900/20 border-blue-700 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-sm text-blue-200">Loading dispatch data from Fish...</span>
            </div>
          </CardContent>
        </Card>
      )}
      {error && !loading && (
        <Card className="bg-amber-900/20 border-amber-700 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-amber-200">Using cached data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tech List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Technicians
          </h2>

          <div className="space-y-2">
            {techs.map((tech) => (
              <Card
                key={tech.id}
                className={cn(
                  "bg-slate-900 border-slate-800 cursor-pointer transition-all",
                  selectedTech === tech.id && "border-amber-600 bg-amber-900/10",
                )}
                onClick={() => setSelectedTech(selectedTech === tech.id ? null : tech.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                        tech.status === "on-job"
                          ? "bg-green-600"
                          : tech.status === "travelling"
                            ? "bg-blue-600"
                            : tech.status === "available"
                              ? "bg-slate-600"
                              : "bg-red-600",
                      )}
                    >
                      {tech.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{tech.name}</p>
                      <p className="text-xs text-slate-400 truncate">{tech.currentLocation}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs shrink-0",
                        tech.status === "on-job"
                          ? "border-green-700 text-green-300"
                          : tech.status === "travelling"
                            ? "border-blue-700 text-blue-300"
                            : tech.status === "available"
                              ? "border-slate-600 text-slate-300"
                              : "border-red-700 text-red-300",
                      )}
                    >
                      {tech.status.replace("-", " ")}
                    </Badge>
                  </div>

                  {tech.currentJob && (
                    <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-slate-300">
                      Current: {tech.currentJob}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Schedule/Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Schedule
            </h2>
            {selectedTech && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedTech(null)} className="text-slate-400">
                Clear filter
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {filteredJobs.map((job) => {
              const tech = techs.find((t) => t.id === job.techId)
              return (
                <Card key={job.id} className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Time */}
                      <div className="text-center shrink-0 w-16">
                        <p className="text-lg font-bold text-white">{job.time}</p>
                        <p className="text-xs text-slate-500">{job.duration}</p>
                      </div>

                      {/* Divider */}
                      <div
                        className={cn(
                          "w-1 h-full min-h-[80px] rounded-full",
                          job.status === "in-progress"
                            ? "bg-green-500"
                            : job.status === "scheduled"
                              ? "bg-amber-500"
                              : job.status === "completed"
                                ? "bg-slate-600"
                                : "bg-red-500",
                        )}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-white">{job.customerName}</p>
                            <p className="text-sm text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.address}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0",
                              job.status === "in-progress"
                                ? "border-green-700 text-green-300"
                                : job.status === "scheduled"
                                  ? "border-amber-700 text-amber-300"
                                  : job.status === "completed"
                                    ? "border-slate-600 text-slate-400"
                                    : "border-red-700 text-red-300",
                            )}
                          >
                            {job.status.replace("-", " ")}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-300 mt-1">{job.jobType}</p>

                        {tech && (
                          <div className="flex items-center gap-2 mt-2">
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold",
                                tech.status === "on-job" ? "bg-green-600" : "bg-slate-600",
                              )}
                            >
                              {tech.name.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-400">{tech.name}</span>
                          </div>
                        )}

                        {/* Tom Notes */}
                        {job.tomNotes && (
                          <div className="mt-2 p-2 bg-amber-900/20 border border-amber-800/50 rounded text-xs text-amber-300">
                            Tom: {job.tomNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
