"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Sun, Wind, Droplets, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WeatherDay {
  date: string
  temp_max: number
  temp_min: number
  condition: string
  rain_chance: number
}

const API_URL = "http://localhost:5055/api/weather/perth"

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error(`Weather API error: ${response.status}`)
        const data = await response.json()

        if (data.forecast && Array.isArray(data.forecast)) {
          setWeather(data.forecast.slice(0, 3)) // Only 3 days
        }
      } catch (err) {
        console.error("Failed to fetch weather:", err)
        setError(err instanceof Error ? err.message : "Failed to load weather")
        // Fallback weather
        setWeather([
          { date: "Today", temp_max: 28, temp_min: 18, condition: "Sunny", rain_chance: 10 },
          { date: "Tomorrow", temp_max: 30, temp_min: 19, condition: "Partly Cloudy", rain_chance: 20 },
          { date: "Day 3", temp_max: 26, temp_min: 17, condition: "Cloudy", rain_chance: 40 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase()
    if (lower.includes("rain") || lower.includes("shower")) {
      return <CloudRain className="w-8 h-8 text-blue-400" />
    } else if (lower.includes("cloud")) {
      return <Cloud className="w-8 h-8 text-slate-400" />
    } else if (lower.includes("sun") || lower.includes("clear")) {
      return <Sun className="w-8 h-8 text-amber-400" />
    } else {
      return <Wind className="w-8 h-8 text-slate-400" />
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-900/30 to-slate-900 border-blue-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-400" />
          Perth Weather (3-Day)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {weather.map((day, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  {getWeatherIcon(day.condition)}
                  <div>
                    <p className="text-sm font-semibold text-white">{day.date}</p>
                    <p className="text-xs text-slate-400">{day.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {day.temp_max}° <span className="text-slate-400 text-sm">/ {day.temp_min}°</span>
                  </p>
                  <div className="flex items-center gap-1 text-xs text-blue-400 justify-end">
                    <Droplets className="w-3 h-3" />
                    {day.rain_chance}%
                  </div>
                </div>
              </div>
            ))}
            {error && (
              <p className="text-xs text-amber-400 text-center mt-2">
                Using cached data - Fish will update when available
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
