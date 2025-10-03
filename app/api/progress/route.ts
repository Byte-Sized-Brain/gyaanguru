import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { roadmapId, moduleIndex, topicIndex, completed } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: existing, error: checkError } = await supabase
      .from("progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("roadmap_id", roadmapId)
      .eq("module_index", moduleIndex)
      .eq("topic_index", topicIndex)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing progress:", checkError)
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
    }

    if (completed) {
      // Mark as completed
      const { error } = await supabase.from("progress").upsert(
        {
          user_id: user.id,
          roadmap_id: roadmapId,
          module_index: moduleIndex,
          topic_index: topicIndex,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,roadmap_id,module_index,topic_index",
        },
      )

      if (error) {
        console.error("Error saving progress:", error)
        return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
      }

      if (!existing) {
        const { data: profileBefore } = await supabase.from("profiles").select("points").eq("id", user.id).single()
        const currentPoints = Math.max(0, Number(profileBefore?.points ?? 0))
        const newPoints = currentPoints + 5
        const { error: incError } = await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id)
        if (incError) {
          console.error("Error awarding points:", incError)
          // continue even if increment fails
        }
      }
    } else {
      // Mark as incomplete (delete the record)
      if (existing) {
        // Deduct 5 points but clamp at 0
        const { data: profileBefore } = await supabase.from("profiles").select("points").eq("id", user.id).single()
        const currentPoints = Math.max(0, Number(profileBefore?.points ?? 0))
        const newPoints = Math.max(0, currentPoints - 5)
        const { error: decError } = await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id)
        if (decError) {
          console.error("Error deducting points:", decError)
          // continue even if deduction fails
        }
      }

      const { error } = await supabase
        .from("progress")
        .delete()
        .eq("user_id", user.id)
        .eq("roadmap_id", roadmapId)
        .eq("module_index", moduleIndex)
        .eq("topic_index", topicIndex)

      if (error) {
        console.error("Error removing progress:", error)
        return NextResponse.json({ error: "Failed to remove progress" }, { status: 500 })
      }
    }

    const { data: profileAfter } = await supabase.from("profiles").select("points").eq("id", user.id).single()

    return NextResponse.json({ success: true, points: profileAfter?.points ?? 0 })
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roadmapId = searchParams.get("roadmapId")

    if (!roadmapId) {
      return NextResponse.json({ error: "Roadmap ID required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: progress, error } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("roadmap_id", roadmapId)

    if (error) {
      console.error("Error fetching progress:", error)
      return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
    }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
