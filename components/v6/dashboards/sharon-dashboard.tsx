"use client"

import { useState, useEffect } from "react"
import { DollarSign, AlertTriangle, CheckCircle2, Phone, MessageSquare, MoreHorizontal, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { mockQueueItems, mockSharonStats } from "@/lib/mock-data"

type FilterType = "all" | "overdue" | "callbacks" | "quotes" | "chase"

const API_URL = "http://localhost:5055/api/dashboard/sharon"

export function SharonDashboard() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [stats, setStats] = useState(mockSharonStats)
  const [queueItems, setQueueItems] = useState(mockQueueItems)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real data from Fish API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error(`API error: ${response.status}`)
        const data = await response.json()

        // Update stats if provided
        if (data.outstanding !== undefined) {
          setStats({
            outstanding: data.outstanding || 0,
            overdue: data.overdue || 0,
            collectedToday: data.collectedToday || 0,
            tomChasing: data.tomChasing || 0,
          })
        }

        // Update queue items if provided
        if (data.queueItems && Array.isArray(data.queueItems)) {
          setQueueItems(data.queueItems)
        }
      } catch (err) {
        console.error("Failed to fetch Sharon's data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
        // Keep using mock data on error
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const items = queueItems.filter((item) => {
    if (activeFilter === "all") return true
    if (activeFilter === "overdue") return item.type === "overdue-invoice"
    if (activeFilter === "callbacks") return item.type === "callback"
    if (activeFilter === "quotes") return item.type === "quote-followup"
    if (activeFilter === "chase") return item.priority === "high"
    return true
  })

  const exceptionCounts = {
    overdue: queueItems.filter((i) => i.type === "overdue-invoice").length,
    callbacks: queueItems.filter((i) => i.type === "callback").length,
    quotes: queueItems.filter((i) => i.type === "quote-followup").length,
    chase: queueItems.filter((i) => i.priority === "high").length,
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      {/* Loading/Error Indicator */}
      {loading && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-sm text-blue-200">Loading real data from Fish...</span>
            </div>
          </CardContent>
        </Card>
      )}
      {error && !loading && (
        <Card className="bg-amber-900/20 border-amber-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-sm text-amber-200">Using cached data: {error}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Outstanding</p>
                <p className="text-2xl font-bold text-white">${stats.outstanding.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Overdue</p>
                <p className="text-2xl font-bold text-red-400">${stats.overdue.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Collected Today</p>
                <p className="text-2xl font-bold text-green-400">${stats.collectedToday.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Tom Chasing</p>
                <p className="text-2xl font-bold text-blue-400">{stats.tomChasing}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exception Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("all")}
          className={cn(activeFilter === "all" ? "bg-amber-600 hover:bg-amber-700" : "border-slate-700 text-slate-300")}
        >
          All Items
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveFilter("overdue")}
          className={cn(
            "gap-2 border-slate-700",
            activeFilter === "overdue" && "bg-red-900/30 border-red-700 text-red-300",
          )}
        >
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Overdue ({exceptionCounts.overdue})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveFilter("callbacks")}
          className={cn(
            "gap-2 border-slate-700",
            activeFilter === "callbacks" && "bg-blue-900/30 border-blue-700 text-blue-300",
          )}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Callbacks ({exceptionCounts.callbacks})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveFilter("quotes")}
          className={cn(
            "gap-2 border-slate-700",
            activeFilter === "quotes" && "bg-purple-900/30 border-purple-700 text-purple-300",
          )}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          Quotes ({exceptionCounts.quotes})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveFilter("chase")}
          className={cn(
            "gap-2 border-slate-700",
            activeFilter === "chase" && "bg-amber-900/30 border-amber-700 text-amber-300",
          )}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Needs Chase ({exceptionCounts.chase})
        </Button>

        {activeFilter !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveFilter("all")}
            className="text-slate-400 hover:text-white"
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Work Queue</h2>
          <span className="text-sm text-slate-400">{items.length} items</span>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Priority Indicator */}
                  <div
                    className={cn(
                      "w-1 h-full min-h-[60px] rounded-full shrink-0",
                      item.priority === "high"
                        ? "bg-red-500"
                        : item.priority === "medium"
                          ? "bg-amber-500"
                          : "bg-slate-600",
                    )}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{item.customerName}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              item.type === "overdue-invoice"
                                ? "border-red-700 text-red-300"
                                : item.type === "callback"
                                  ? "border-blue-700 text-blue-300"
                                  : item.type === "quote-followup"
                                    ? "border-purple-700 text-purple-300"
                                    : "border-slate-700 text-slate-300",
                            )}
                          >
                            {item.type.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">{item.summary}</p>
                      </div>

                      {item.amount && (
                        <p className="text-lg font-semibold text-white shrink-0">${item.amount.toLocaleString()}</p>
                      )}
                    </div>

                    {/* Context from Tom */}
                    {item.tomContext && (
                      <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-amber-300 flex items-start gap-2">
                        <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>Tom: {item.tomContext}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-8">
                        <Phone className="w-3 h-3 mr-1.5" />
                        Ask Tom to Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-700 text-slate-300 h-8 bg-transparent"
                      >
                        <MessageSquare className="w-3 h-3 mr-1.5" />
                        Send SMS
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 h-8 ml-auto">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
