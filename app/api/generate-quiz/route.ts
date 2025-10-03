import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { topic, description } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Generate a quiz with 4 multiple-choice questions about "${topic}".

Context: ${description}

Return ONLY a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Requirements:
- Exactly 4 questions
- Each question must have exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Questions should test understanding, not just memorization
- Include a brief explanation for each answer`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Clean up the response to extract JSON
    let jsonText = responseText.trim()

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    // Parse the JSON
    const quiz = JSON.parse(jsonText)

    // Validate the structure
    if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      throw new Error("Invalid quiz structure")
    }

    return NextResponse.json({ quiz })
  } catch (error) {
    console.error("Error generating quiz:", error)
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}
