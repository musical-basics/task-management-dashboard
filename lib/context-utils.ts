import { Task } from "@/lib/types"

export function findParent(root: Task, targetId: string): Task | null {
    if (!root.children) return null

    for (const child of root.children) {
        if (child.id === targetId) {
            return root
        }
        const found = findParent(child, targetId)
        if (found) return found
    }
    return null
}

export function buildContextString(root: Task, targetId: string): string {
    const parent = findParent(root, targetId)
    if (!parent) return "This is a root level task."

    // Get sibling tasks (completed or planned) to give AI context of what's already being done
    const siblings = parent.children || []

    if (siblings.length <= 1) { // Only the target task itself exists
        return `Parent Goal: "${parent.title}"`
    }

    const siblingSummary = siblings
        .filter(child => child.id !== targetId) // Exclude self
        .map(child => {
            const subSteps = child.children?.map(c => c.title).slice(0, 3).join(", ")
            const subStepStr = subSteps ? ` (Includes: ${subSteps}...)` : ""
            return `- Sibling Task: "${child.title}"${subStepStr}`
        })
        .join("\n")

    return `
PARENT GOAL: "${parent.title}"

CONTEXT - SIBLING TASKS (ALREADY PLANNED):
${siblingSummary}

INSTRUCTION: Ensure your new subtasks for "${siblings.find(s => s.id === targetId)?.title}" complement the above. Do not duplicate work already covered by siblings.
  `.trim()
}
