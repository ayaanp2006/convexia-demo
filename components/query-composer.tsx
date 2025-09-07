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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [target, setTarget] = useState("")
  const [indication, setIndication] = useState("")
  const [modality, setModality] = useState("")
  const [geography, setGeography] = useState("")
  const [stage, setStage] = useState("")
  const [exclusions, setExclusions] = useState("")
  const [timeWindow, setTimeWindow] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recentQueries, setRecentQueries] = useState<Query[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(false)
  const { toast } = useToast()

  // Load draft from localStorage
  useEffect(() => {
    if (email) {
      const savedDraft = localStorage.getItem(`convexia_draft_${email}`)
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          setTarget(draft.target || "")
          setIndication(draft.indication || "")
          setModality(draft.modality || "")
          setGeography(draft.geography || "")
          setStage(draft.stage || "")
          setExclusions(draft.exclusions || "")
          setTimeWindow(draft.timeWindow || "")
          setAdditionalInfo(draft.additionalInfo || "")
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }, [email])

  // Save draft to localStorage
  useEffect(() => {
    if (email) {
      const draft = {
        target,
        indication,
        modality,
        geography,
        stage,
        exclusions,
        timeWindow,
        additionalInfo
      }
      localStorage.setItem(`convexia_draft_${email}`, JSON.stringify(draft))
    }
  }, [email, target, indication, modality, geography, stage, exclusions, timeWindow, additionalInfo])

  useEffect(() => {
    loadRecentQueries()
  }, [email])

  const loadRecentQueries = async () => {
    setIsLoadingRecent(true)
    const result = await getRecentQueries(email)

    if (result.success) {
      setRecentQueries(result.data || [])
    } else {
      console.error("[v0] Failed to load recent queries:", result.error)
    }

    setIsLoadingRecent(false)
  }

  const handleExampleClick = (exampleQuery: string) => {
    // Parse example query and populate fields
    // For now, just put it in additional info
    setAdditionalInfo(exampleQuery)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Build structured query text
    const queryParts = []
    if (target) queryParts.push(`Target: ${target}`)
    if (indication) queryParts.push(`Indication: ${indication}`)
    if (modality) queryParts.push(`Modality: ${modality}`)
    if (geography) queryParts.push(`Geography: ${geography}`)
    if (stage) queryParts.push(`Stage: ${stage}`)
    if (exclusions) queryParts.push(`Exclusions: ${exclusions}`)
    if (timeWindow) queryParts.push(`Time window: ${timeWindow}`)
    if (additionalInfo) queryParts.push(`Additional information: ${additionalInfo}`)
    
    const queryText = queryParts.join("; ")

    const formData = new FormData()
    formData.append("query", queryText)
    formData.append("facets", JSON.stringify({
      target,
      indication,
      modality,
      geography,
      stage,
      exclusions,
      timeWindow,
      additionalInfo
    }))
    formData.append("email", email)

    const result = await saveQuery(formData)

    if (result.success) {
      const timestamp = new Date().toLocaleTimeString()
      toast({
        title: "Saved to Convexia",
        description: `Query saved at ${timestamp}`,
      })

      // Clear draft and reload recent queries
      localStorage.removeItem(`convexia_draft_${email}`)
      setTarget("")
      setIndication("")
      setModality("")
      setGeography("")
      setStage("")
      setExclusions("")
      setTimeWindow("")
      setAdditionalInfo("")
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
    setTarget("")
    setIndication("")
    setModality("")
    setGeography("")
    setStage("")
    setExclusions("")
    setTimeWindow("")
    setAdditionalInfo("")
    if (email) {
      localStorage.removeItem(`convexia_draft_${email}`)
    }
  }

  const handleReuseQuery = (queryText: string) => {
    // For now, put the reused query in additional info
    setAdditionalInfo(queryText)
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

          {/* Structured Query Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target" className="text-sm font-medium">
                  Target
                </Label>
                <Input
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g., NaV1.8, TNF-α, GLP-1R"
                  className="transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indication" className="text-sm font-medium">
                  Indication
                </Label>
                <Input
                  id="indication"
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                  placeholder="e.g., neuropathic pain, inflammation"
                  className="transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modality" className="text-sm font-medium">
                  Modality
                </Label>
                <Input
                  id="modality"
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  placeholder="e.g., small-molecule, oral"
                  className="transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="geography" className="text-sm font-medium">
                  Geography
                </Label>
                <Input
                  id="geography"
                  value={geography}
                  onChange={(e) => setGeography(e.target.value)}
                  placeholder="e.g., China, US, EU"
                  className="transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage" className="text-sm font-medium">
                  Stage
                </Label>
                <Input
                  id="stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  placeholder="e.g., preclinical, Phase 1"
                  className="transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exclusions" className="text-sm font-medium">
                  Exclusions
                </Label>
                <Input
                  id="exclusions"
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  placeholder="e.g., top-10 pharma, discontinued"
                  className="transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeWindow" className="text-sm font-medium">
                  Time window
                </Label>
                <Select value={timeWindow} onValueChange={setTimeWindow}>
                  <SelectTrigger className="transition-colors">
                    <SelectValue placeholder="Select time window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last 2y">Last 2 years</SelectItem>
                    <SelectItem value="last 5y">Last 5 years</SelectItem>
                    <SelectItem value="last 7y">Last 7 years</SelectItem>
                    <SelectItem value="any">Any time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo" className="text-sm font-medium">
                Additional information
              </Label>
              <Textarea
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Any additional context, specific requirements, or detailed criteria..."
                className="min-h-24 resize-none transition-colors"
              />
            </div>
          </div>


          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading || !email}
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

        <Separator />

        {/* Example Queries */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Example queries</Label>
          <div className="space-y-2">
            {EXAMPLE_QUERIES.map((example, index) => (
              <div
                key={index}
                className="p-3 bg-muted/30 rounded-lg border border-border/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleExampleClick(example)}
              >
                <p className="text-sm text-foreground">{example}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
