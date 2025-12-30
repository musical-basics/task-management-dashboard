"use client"

import { useState, useEffect } from "react"
import type { Task, ProposedSubtask } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, Sparkles, Loader2 } from "lucide-react"

interface SplitModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onApply: (taskId: string, subtasks: ProposedSubtask[]) => void
}

export function SplitModal({ task, isOpen, onClose, onApply }: SplitModalProps) {
  const [subtasks, setSubtasks] = useState<ProposedSubtask[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch AI Suggestions when modal opens
  useEffect(() => {
    async function generateSubtasks() {
      if (!task || !isOpen) return

      setIsLoading(true)
      setSubtasks([]) // Clear old suggestions

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskTitle: task.title })
        })

        const data = await res.json()

        if (data.tasks && Array.isArray(data.tasks)) {
          const formatted: ProposedSubtask[] = data.tasks.map((t: any, i: number) => ({
            id: `gen-${Date.now()}-${i}`,
            title: t.title,
            estimate: t.estimate,
            selected: true
          }))
          setSubtasks(formatted)
        }
      } catch (err) {
        console.error("Failed to generate", err)
        // Fallback or error toast here
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      generateSubtasks()
    }
  }, [isOpen, task])

  const totalTime = subtasks.filter((s) => s.selected).reduce((sum, s) => sum + s.estimate, 0)
  const targetTime = task?.estimate || 0

  const updateSubtask = (id: string, updates: Partial<ProposedSubtask>) => {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  const addSubtask = () => {
    setSubtasks((prev) => [...prev, { id: `new-${Date.now()}`, title: "", estimate: 5, selected: true }])
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-cyan-900/20 text-slate-100">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest font-medium">AI Agent</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Splitting: "{task?.title}"
          </DialogTitle>
        </DialogHeader>

        <div className="py-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              <p className="text-sm">Analyzing task complexity...</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3">
                <h4 className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Proposed Steps:</h4>
                {subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="flex items-center gap-3 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                    <Checkbox
                      checked={subtask.selected}
                      onCheckedChange={(checked) => updateSubtask(subtask.id, { selected: checked as boolean })}
                      className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <span className="text-xs text-slate-500 font-mono w-5">{index + 1}.</span>
                    <input
                      value={subtask.title}
                      onChange={(e) => updateSubtask(subtask.id, { title: e.target.value })}
                      className="flex-1 py-1.5 text-sm text-slate-200 bg-transparent border-b border-white/10 focus:border-cyan-500/50 focus:outline-none transition-colors"
                      placeholder="Step description..."
                    />
                    <input
                      type="number"
                      value={subtask.estimate}
                      onChange={(e) => updateSubtask(subtask.id, { estimate: parseInt(e.target.value) || 0 })}
                      className="w-12 py-1.5 text-sm text-center font-mono text-slate-200 bg-transparent border-b border-white/10 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    />
                    <span className="text-xs text-slate-500">m</span>
                    <button onClick={() => removeSubtask(subtask.id)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button onClick={addSubtask} className="flex items-center gap-2 px-1 py-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Step</span>
                </button>
              </div>

              {/* Summary Bar */}
              <div className="relative px-4 py-3 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.min((totalTime / targetTime) * 100, 100)}%` }} />
                <span className="text-sm text-slate-400">
                  Total: <span className="text-cyan-400 font-mono">{totalTime}m</span> / {targetTime}m
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-white/10 pt-4 gap-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button
            onClick={() => task && onApply(task.id, subtasks)}
            disabled={isLoading || subtasks.length === 0}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0"
          >
            Approve & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
