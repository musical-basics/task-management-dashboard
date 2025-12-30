export interface Task {
  id: string
  title: string
  estimate: number
  depth: number
  children: Task[]
  isExpanded?: boolean
}

export interface Project {
  id: string
  name: string
  emoji: string
  mode: "creative" | "technical" | "admin"
  context?: string
}

export interface ProposedSubtask {
  id: string
  title: string
  estimate: number
  selected: boolean
}

export interface CompletedTask {
  id: string
  title: string
  estimate: number
  completedAt: Date
  projectName: string
}
