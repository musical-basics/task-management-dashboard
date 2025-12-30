"use client"

import type { Task } from "@/lib/types"
import { TaskItem } from "./task-item"
import { AlertTriangle, Plus } from "lucide-react"

interface MainStageProps {
  tasks: Task
  onToggle: (id: string) => void
  onSplit: (task: Task) => void
  onFocus: (task: Task) => void
  onAdd: (task: Task) => void   // <--- NEW
  onEdit: (task: Task) => void  // <--- NEW
}

function calculateTotalTime(task: Task): number {
  if (task.children.length === 0) return task.estimate
  return task.children.reduce((sum, child) => sum + calculateTotalTime(child), 0)
}

export function MainStage({ tasks, onToggle, onSplit, onFocus, onAdd, onEdit }: MainStageProps) {
  const totalAccumulated = calculateTotalTime(tasks)
  const isOverBudget = totalAccumulated > tasks.estimate

  return (
    <main className="flex-1 bg-gradient-to-br from-slate-900 to-[#0B1120] overflow-y-auto relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.03),transparent_70%)] pointer-events-none" />

      <div className="max-w-3xl mx-auto p-8 relative">
        <header className="mb-8 group">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{tasks.title}</h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm font-mono text-slate-500">Est: {tasks.estimate}m</span>
                <span className="text-slate-600">|</span>
                <span className={`text-sm font-mono flex items-center gap-1.5 ${isOverBudget ? "text-amber-400" : "text-slate-500"}`}>
                  {isOverBudget && <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  Accumulated: {totalAccumulated}m
                </span>
              </div>
            </div>

            {/* Top Level Add Button */}
            <button
              onClick={() => onAdd(tasks)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg transition-all border border-emerald-500/20 hover:border-emerald-500/40"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>
          <div className="mt-6 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${Math.min((totalAccumulated / tasks.estimate) * 100, 100)}%` }}
            />
          </div>
        </header>

        <div className="space-y-1">
          {tasks.children.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p className="mb-4">No tasks yet.</p>
              <button onClick={() => onAdd(tasks)} className="text-cyan-400 hover:text-cyan-300 hover:underline">
                Create your first task
              </button>
            </div>
          ) : (
            tasks.children.map((child) => (
              <TaskItem
                key={child.id}
                task={child}
                onToggle={onToggle}
                onSplit={onSplit}
                onFocus={onFocus}
                onAdd={onAdd}   // <--- Pass it down
                onEdit={onEdit} // <--- Pass it down
              />
            ))
          )}
        </div>
      </div>
    </main>
  )
}
