"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export interface QueryResult {
  success: boolean
  error?: string
  data?: any
}

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"

export async function saveQuery(formData: FormData): Promise<QueryResult> {
  try {
    await requireAuth()

    const queryText = formData.get("query") as string
    const facets = formData.get("facets") as string

    if (!queryText) {
      return {
        success: false,
        error: "Query is required",
      }
    }

    if (queryText.length < 120) {
      return {
        success: false,
        error: "Query must be at least 120 characters",
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("queries")
      .insert({
        user_id: DEMO_USER_ID,
        facets: facets || "",
        query_text: queryText,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return {
        success: false,
        error: "Failed to save query",
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("[v0] Save query error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function getRecentQueries(): Promise<QueryResult> {
  try {
    await requireAuth()

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("queries")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) {
      console.error("[v0] Supabase error:", error)
      return {
        success: false,
        error: "Failed to fetch queries",
      }
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error("[v0] Get queries error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}
