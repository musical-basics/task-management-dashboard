"use client"

import type { CompletedTask } from "@/lib/types"
import { CheckCircle2, Clock, X } from "lucide-react"

interface CompletedPanelProps {
  completedTasks: CompletedTask[]
  isOpen: boolean
  onClose: () => void
}

export function CompletedPanel({ completedTasks, isOpen, onClose }: CompletedPanelProps) {
  if (!isOpen) return null

  const totalTime = completedTasks.reduce((sum, task) => sum + task.estimate, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 max-h-[80vh] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Completed Items</h2>
              <p className="text-xs text-slate-400">
                {completedTasks.length} tasks · {totalTime}m total
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Task List */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {completedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-slate-500">No completed tasks yet</p>
              <p className="text-sm text-slate-600 mt-1">Complete some tasks to see them here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.projectName}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    {task.estimate}m
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
