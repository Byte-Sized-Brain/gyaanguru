import { NextResponse } from "next/server"
import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"

const ResponseSchema = z.object({
  content: z.array(z.string()).min(1),
})

function extractJsonPayload(s: string) {
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence && fence[1]) return fence[1].trim()
  const first = s.indexOf("{")
  const last = s.lastIndexOf("}")
  if (first !== -1 && last !== -1 && last > first) return s.slice(first, last + 1).trim()
  return s.trim()
}

export async function POST(req: Request) {
  try {
    const { roadmapTitle, moduleTitle, topicTitle, description } = await req.json()

    if (!topicTitle || !moduleTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `
You are an expert instructor writing concise, high‑quality lesson notes.

Course: ${roadmapTitle || "N/A"}
Module: ${moduleTitle}
Lesson: ${topicTitle}
Lesson Overview: ${description || "N/A"}

Write in-depth lesson content that:
- Explains core concepts clearly and progressively
- Includes practical tips and mini-examples where useful
- Uses short paragraphs and clear language suitable for self-study
- Avoids markdown headings, code fences, and lists—just paragraphs

Return ONLY valid JSON in the form:
{
  "content": [
    "Paragraph 1...",
    "Paragraph 2...",
    "Paragraph 3..."
  ]
}
`.trim()

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const raw = extractJsonPayload(text)

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(raw)
    } catch (e) {
      console.log("[v0] In-depth raw preview (first 400 chars):", text.slice(0, 400))
      return NextResponse.json({ error: "Model returned non-JSON output" }, { status: 502 })
    }

    const validated = ResponseSchema.safeParse(parsedJson)
    if (!validated.success) {
      console.log("[v0] In-depth schema error:", validated.error?.message)
      return NextResponse.json({ error: "Model output did not match schema" }, { status: 422 })
    }

    return NextResponse.json(validated.data)
  } catch (err) {
    console.error("[v0] In-depth generation error:", err)
    return NextResponse.json({ error: "Failed to generate in-depth content" }, { status: 500 })
  }
}
