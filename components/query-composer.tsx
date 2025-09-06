"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { HelpCircle, RotateCcw } from "lucide-react"
import Image from "next/image"
import { saveQuery, getRecentQueries } from "@/lib/actions/queries"

const EXAMPLE_QUERIES = [
  "NaV1.8 small-molecule programs in China at preclinical stage that fit the 5AM Ventures portfolio; exclude top-10 pharma unless optioned but unexercised.",
  "TNF-α oral small-molecule candidates with the most potent, validated experimental data for inflammation; prioritize peer-reviewed or well-annotated datasets.",
  "Oral small-molecule GLP-1R & GIPR programs from Japan/China/South Korea shelved or paused in the last 5–7 years; exclude top-10 pharma unless optioned but unexercised; include rationale for discontinuation.",
  "In-licensable ocular candidates—preclinical to discontinued through Phase 2—that directly inhibit Properdin or validated Properdin-adjacent mechanisms in the alternative complement pathway; include credible MoA evidence.",
  "First-in-class RIPK1 inhibitors for neuroinflammation in early clinical stages (Ph1–Ph2), ex-US only; include biomarker strategy and IP status.",
]

interface Query {
  id: string
  user_id: string
  query_text: string
  facets: string
  created_at: string
}

export function QueryComposer() {
  const [email, setEmail] = useState("")
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recentQueries, setRecentQueries] = useState<Query[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(false)
  const { toast } = useToast()

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(`convexia_draft_${email}`)
    if (savedDraft && email) {
      setQuery(savedDraft)
    }
  }, [email])

  // Save draft to localStorage
  useEffect(() => {
    if (email && query) {
      localStorage.setItem(`convexia_draft_${email}`, query)
    }
  }, [email, query])

  useEffect(() => {
    loadRecentQueries()
  }, [])

  const loadRecentQueries = async () => {
    setIsLoadingRecent(true)
    const result = await getRecentQueries()

    if (result.success) {
      setRecentQueries(result.data || [])
    } else {
      console.error("[v0] Failed to load recent queries:", result.error)
    }

    setIsLoadingRecent(false)
  }

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append("query", query)
    formData.append("facets", "")

    const result = await saveQuery(formData)

    if (result.success) {
      const timestamp = new Date().toLocaleTimeString()
      toast({
        title: "Saved to Convexia",
        description: `Query saved at ${timestamp}`,
      })

      // Clear draft and reload recent queries
      localStorage.removeItem(`convexia_draft_${email}`)
      await loadRecentQueries()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save query",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleClear = () => {
    setQuery("")
    if (email) {
      localStorage.removeItem(`convexia_draft_${email}`)
    }
  }

  const handleReuseQuery = (queryText: string) => {
    setQuery(queryText)
  }

  const formatQuerySnippet = (text: string) => {
    return text.length > 110 ? text.substring(0, 110) + "..." : text
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <Image src="/convexia-logo.png" alt="Convexia" width={24} height={24} className="w-6 h-6" />
          <CardTitle className="text-2xl font-semibold tracking-tight">Query Composer</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">Give us context; we'll do the digging.</p>
          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 p-1">
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">How to write a great query</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Work email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@company.com"
              required
              className="transition-colors"
            />
            <p className="text-xs text-muted-foreground">We'll associate saved queries with this email.</p>
          </div>

          {/* Query Textarea */}
          <div className="space-y-2">
            <Label htmlFor="query" className="text-sm font-medium">
              Your query
            </Label>
            <Textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find oral/small-molecule NaV1.8 programs in China at preclinical stage that fit 5AM Ventures' portfolio; exclude top-10 pharma unless optioned but unexercised; focus on the last 5 years."
              className="min-h-32 resize-none transition-colors"
              required
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {query.length >= 120 ? "✓" : "⚠"} {query.length} characters
                {query.length < 120 && " (minimum 120)"}
              </p>
            </div>
          </div>

          {/* Example Queries */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">One-click examples</Label>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((example, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-200 transition-colors text-xs py-1 px-2 max-w-xs truncate"
                  onClick={() => handleExampleClick(example)}
                  title={example}
                >
                  Example {index + 1}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading || !email || query.length < 120}
              className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
            >
              {isLoading ? "Submitting..." : "Submit to Convexia"}
            </Button>
            <Button type="button" variant="ghost" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </form>

        <Separator />

        {/* Recent Queries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Recent (last 5 for this email)</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadRecentQueries}
              disabled={isLoadingRecent}
              className="h-8 px-2"
            >
              <RotateCcw className={`h-3 w-3 ${isLoadingRecent ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {recentQueries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved queries yet.</p>
          ) : (
            <div className="space-y-2">
              {recentQueries.map((recentQuery) => (
                <div
                  key={recentQuery.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{formatQuerySnippet(recentQuery.query_text)}</p>
                    <p className="text-xs text-muted-foreground">{formatTimestamp(recentQuery.created_at)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReuseQuery(recentQuery.query_text)}
                    className="ml-2 text-emerald-600 hover:text-emerald-700"
                  >
                    Re-use
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
