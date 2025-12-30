"use client"

import type { Task } from "@/lib/types"
import { TaskItem } from "./task-item"
import { AlertTriangle } from "lucide-react"

interface MainStageProps {
  tasks: Task
  onToggle: (id: string) => void
  onSplit: (task: Task) => void
  onFocus: (task: Task) => void
}

function calculateTotalTime(task: Task): number {
  if (task.children.length === 0) return task.estimate
  return task.children.reduce((sum, child) => sum + calculateTotalTime(child), 0)
}

export function MainStage({ tasks, onToggle, onSplit, onFocus }: MainStageProps) {
  const totalAccumulated = calculateTotalTime(tasks)
  const isOverBudget = totalAccumulated > tasks.estimate

  return (
    <main className="flex-1 bg-gradient-to-br from-slate-900 to-[#0B1120] overflow-y-auto relative">
      {/* Subtle radial glow in center for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.03),transparent_70%)] pointer-events-none" />

      <div className="max-w-3xl mx-auto p-8 relative">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{tasks.title}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm font-mono text-slate-500">Est: {tasks.estimate}m</span>
            <span className="text-slate-600">|</span>
            <span
              className={`text-sm font-mono flex items-center gap-1.5 ${isOverBudget ? "text-amber-400" : "text-slate-500"}`}
            >
              {isOverBudget && <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />}
              Accumulated: {totalAccumulated}m
            </span>
          </div>
          <div className="mt-4 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${Math.min((totalAccumulated / tasks.estimate) * 100, 100)}%` }}
            />
          </div>
        </header>

        <div className="space-y-1">
          {tasks.children.map((child) => (
            <TaskItem key={child.id} task={child} onToggle={onToggle} onSplit={onSplit} onFocus={onFocus} />
          ))}
        </div>
      </div>
    </main>
  )
}
