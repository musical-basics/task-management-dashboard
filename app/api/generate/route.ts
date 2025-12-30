import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: Request) {
  try {
    const { taskTitle, context } = await req.json()

    if (!taskTitle) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 })
    }

    // 1. Use the "gemini-2.0-flash-exp" model as requested
    // 2. REMOVED 'generationConfig' (JSON mode) to prevent 404s on older models
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    })

    const prompt = `
      You are an expert project manager. 
      Break down the task "${taskTitle}" into 3-5 actionable, concrete subtasks.
      Context: ${context || "General task"}
      
      Rules:
      1. Each subtask must have a time estimate in minutes (integer).
      2. Total time should be roughly realistic.
      3. Return ONLY raw JSON (do not use markdown blocks like \`\`\`json).
      
      Example Output:
      {
        "tasks": [
          { "title": "Subtask name", "estimate": 15 },
          { "title": "Another step", "estimate": 10 }
        ]
      }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    console.log("Raw Gemini Response:", text) // Debugging log

    // CLEANUP: AI often adds markdown formatting even if we ask it not to.
    // This regex strips out ```json and ``` lines.
    text = text.replace(/```json/g, "").replace(/```/g, "").trim()

    // Parse the JSON
    const parsed = JSON.parse(text)

    // Handle both { "tasks": [...] } and direct array [...] formats
    const tasks = parsed.tasks || parsed

    return NextResponse.json({ tasks })

  } catch (error: any) {
    console.error("Gemini AI Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
