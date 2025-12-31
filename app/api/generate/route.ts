import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: Request) {
  try {
    const { taskTitle, context, mode } = await req.json()

    if (!taskTitle) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 })
    }

    // 1. Use the "gemini-2.0-flash-exp" model as requested
    // 2. REMOVED 'generationConfig' (JSON mode) to prevent 404s on older models
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    })

    const isQuick = mode === "quick"

    const prompt = `
      You are a ${isQuick ? "pragmatic productivity assistant" : "thorough project manager"}.
      ${isQuick
        ? "Your goal is to break tasks into IMMEDIATE physical actions. Assume the user is competent and just needs a checklist."
        : "Your goal is to create a detailed plan, including necessary research, review, and preparation phases."}

      Task: "${taskTitle}"
      
      ${context || "Context: General task"}

      Rules:
      1. Break into 3-5 subtasks.
      2. Each subtask must have a 'title' and 'estimate' in minutes.
      3. Return ONLY raw JSON (no markdown).
      4. CRITICAL: Review the "CONTEXT". Do NOT duplicate sibling tasks.
      ${isQuick ? "5. STRICT RULE: NO 'Brainstorm', 'Research', or 'List options'. Go straight to the physical action (e.g. 'Pick song' not 'List potential songs')." : ""}
      
      Example Output:
      {
        "tasks": [
          { "title": "${isQuick ? "Do action A" : "Research Phase 1"}", "estimate": 15 },
          { "title": "${isQuick ? "Do action B" : "Analysis Phase"}", "estimate": 10 }
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
