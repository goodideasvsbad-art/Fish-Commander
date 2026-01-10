"use client"

import { useState, useEffect } from "react"
import { Phone, DollarSign, Users, BarChart3, PieChart, ArrowUpRight, Target, Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockAndyStats, mockLeadSources } from "@/lib/mock-data"

const API_URL = "http://localhost:5055/api/dashboard/andy"

export function AndyDashboard() {
  const [stats, setStats] = useState(mockAndyStats)
  const [leadSources, setLeadSources] = useState(mockLeadSources)
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

        if (data.leadsThisWeek !== undefined) {
          setStats({
            leadsThisWeek: data.leadsThisWeek || 0,
            leadsChange: data.leadsChange || 0,
            conversionRate: data.conversionRate || 0,
            conversionChange: data.conversionChange || 0,
            avgJobValue: data.avgJobValue || 0,
            avgJobChange: data.avgJobChange || 0,
            tomCallsToday: data.tomCallsToday || 0,
            tomBookings: data.tomBookings || 0,
            tomAnswerRate: data.tomAnswerRate || 0,
            tomBookingRate: data.tomBookingRate || 0,
            avgCallDuration: data.avgCallDuration || "0:00",
            missedCalls: data.missedCalls || 0,
          })
        }

        if (data.leadSources && Array.isArray(data.leadSources)) {
          setLeadSources(data.leadSources)
        }
      } catch (err) {
        console.error("Failed to fetch Andy's data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      {loading && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-sm text-blue-200">Loading marketing data from Fish...</span>
            </div>
          </CardContent>
        </Card>
      )}
      {error && !loading && (
        <Card className="bg-amber-900/20 border-amber-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-amber-200">Using cached data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-950 border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-300 uppercase tracking-wide">Leads This Week</p>
                <p className="text-3xl font-bold text-white">{stats.leadsThisWeek}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+{stats.leadsChange}%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-950 border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-300 uppercase tracking-wide">Conversion Rate</p>
                <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+{stats.conversionChange}%</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/50 to-amber-950 border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-300 uppercase tracking-wide">Avg Job Value</p>
                <p className="text-3xl font-bold text-white">${stats.avgJobValue}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+${stats.avgJobChange}</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-950 border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-300 uppercase tracking-wide">Tom Calls</p>
                <p className="text-3xl font-bold text-white">{stats.tomCallsToday}</p>
                <p className="text-xs text-slate-400 mt-1">{stats.tomBookings} bookings</p>
              </div>
              <Phone className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Sources */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Lead Sources This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leadSources.map((source) => (
              <div key={source.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{source.name}</span>
                  <span className="text-white font-medium">{source.leads} leads</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{source.percentage}% of total</span>
                  <span>${source.revenue.toLocaleString()} revenue</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              Tom's Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-white">{stats.tomAnswerRate}%</p>
                <p className="text-xs text-slate-400">Answer rate</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-white">{stats.tomBookingRate}%</p>
                <p className="text-xs text-slate-400">Booking rate</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-white">{stats.avgCallDuration}</p>
                <p className="text-xs text-slate-400">Avg call time</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-white">{stats.missedCalls}</p>
                <p className="text-xs text-slate-400">Missed calls</p>
              </div>
            </div>

            <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <p className="text-sm text-green-300">
                Tom is performing <span className="font-bold">23% better</span> than last week. Booking rate is up and
                call times are down.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
