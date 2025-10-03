import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { message, topic, context } = await request.json()

    if (!message || !topic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `You are an AI instructor helping a student learn about "${topic}".

Context about the lesson: ${context}

Student's question: ${message}

Provide a helpful, clear, and concise response that:
1. Directly answers the student's question
2. Uses simple language and examples when appropriate
3. Encourages further learning
4. Stays focused on the topic

Keep your response under 200 words.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in AI instructor:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
