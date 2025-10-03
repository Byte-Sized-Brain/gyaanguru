import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("[v0] Missing GEMINI_API_KEY")
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })
    }

    const { messages, persona, rag } = await req.json()

    // Build conversation in Gemini "contents" format
    // Gemini expects roles: "user" and "model"
    const contents =
      Array.isArray(messages) && messages.length > 0
        ? messages.map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }))
        : []

    const personaNormalized =
      typeof persona === "string" && ["learner", "trainer", "policymaker"].includes(persona)
        ? (persona as "learner" | "trainer" | "policymaker")
        : "learner"
    const ragEnabled = typeof rag === "boolean" ? rag : true

    const systemPrompt = `You are an expert career guidance counselor supporting ${personaNormalized}s.
You ${ragEnabled ? "use Retrieval-Augmented Generation (RAG)" : "provide general guidance without retrieval"} to help with:
- Career exploration and planning
- Skills development and training program recommendations
- Educational policy and workforce development strategies

When relevant, cite frameworks like NSQF (National Skills Qualifications Framework) and provide step-by-step, actionable guidance tailored to the user's role. Keep responses concise yet comprehensive (3–5 paragraphs), with a professional and approachable tone.
If RAG is disabled, avoid implying that specific proprietary sources were retrieved and instead rely on broadly accepted best practices.`

    const payload = {
      contents,
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.7,
      },
    }

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    )

    if (!resp.ok) {
      const errText = await resp.text()
      console.error("[v0] Gemini API error:", resp.status, errText)
      return NextResponse.json({ error: "Gemini API error" }, { status: 500 })
    }

    const json = await resp.json()

    // Extract text from candidates[0].content.parts[].text
    const candidates = json?.candidates ?? []
    const first = candidates[0]
    const parts = first?.content?.parts ?? []
    const text = parts
      .map((p: { text?: string }) => p.text || "")
      .join("\n")
      .trim()

    if (!text) {
      console.warn("[v0] Gemini returned empty content")
      return NextResponse.json({ error: "Empty response" }, { status: 502 })
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error("[v0] Career guidance API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
