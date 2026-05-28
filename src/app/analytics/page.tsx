"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react"

const metrics = [
  { name: "Total Content Generated", value: "1,248", change: "+12%", icon: BarChart3 },
  { name: "Engagement Rate", value: "24.5%", change: "+5%", icon: TrendingUp },
  { name: "Active Users", value: "842", change: "+8%", icon: Users },
  { name: "Avg Turnaround Time", value: "2.4m", change: "-12%", icon: Clock },
]

export default function AnalyticsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Analytics & Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{m.name}</CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{m.value}</div>
                <p className={`text-xs ${m.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{m.change} from last month</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>A/B Testing Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Headline Variants</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Test 3 different headline approaches for your latest blog post</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">CTA Tweaks</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Optimize call-to-action placement for better conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tokens Consumed</span>
                  <span>75,000 / 100,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Cost Per Piece</span>
                  <span>$0.023</span>
                </div>
                <p className="text-xs text-gray-500">Average cost across all generated content</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}