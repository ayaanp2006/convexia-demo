"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { login } from "@/lib/actions/auth"
import Image from "next/image"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="w-full bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
      disabled={pending}
    >
      {pending ? "Signing in..." : "Continue"}
    </Button>
  )
}

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await login(formData)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  return (
    <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader className="space-y-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <Image src="/convexia-logo.jpg" alt="Convexia" width={32} height={32} className="w-8 h-8" />
          <span className="text-2xl font-semibold tracking-tight text-foreground">Convexia</span>
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">Sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter username"
                required
                className={`transition-colors ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                required
                className={`transition-colors ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
          </div>

          {error && (
            <div
              id="error-message"
              className="text-sm text-red-500 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-800"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <SubmitButton />

          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            Use username <strong className="text-foreground">demo</strong> and password{" "}
            <strong className="text-foreground">demo</strong>.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
