"use client"

import { useState } from "react"
import type { Task, ProposedSubtask } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, Sparkles } from "lucide-react"

interface SplitModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onApply: (taskId: string, subtasks: ProposedSubtask[]) => void
}

const generateMockSubtasks = (task: Task): ProposedSubtask[] => {
  if (task.title.toLowerCase().includes("take")) {
    return [
      { id: "step1", title: "Hit record button", estimate: 0, selected: true },
      { id: "step2", title: "Play through once", estimate: 4, selected: true },
      { id: "step3", title: "Listen back to check levels", estimate: 1, selected: true },
    ]
  }

  return [
    { id: "sub1", title: "Setup Microphones", estimate: 5, selected: true },
    { id: "sub2", title: "Warm-up Scales", estimate: 5, selected: true },
    { id: "sub3", title: "Record Takes", estimate: 15, selected: true },
  ]
}

export function SplitModal({ task, isOpen, onClose, onApply }: SplitModalProps) {
  const [subtasks, setSubtasks] = useState<ProposedSubtask[]>([])
  const [savePattern, setSavePattern] = useState(false)

  const handleOpen = () => {
    if (task) {
      setSubtasks(generateMockSubtasks(task))
    }
  }

  const totalTime = subtasks.filter((s) => s.selected).reduce((sum, s) => sum + s.estimate, 0)
  const targetTime = task?.estimate || 0
  const isMatch = totalTime === targetTime

  const updateSubtask = (id: string, updates: Partial<ProposedSubtask>) => {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  const addSubtask = () => {
    const newId = `new-${Date.now()}`
    setSubtasks((prev) => [...prev, { id: newId, title: "New step", estimate: 5, selected: true }])
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} onOpenAutoFocus={handleOpen}>
      <DialogContent className="max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-cyan-900/20">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-widest font-medium">AI Suggestion</span>
          </div>
          <DialogTitle className="text-slate-100 font-bold text-xl tracking-tight">
            Splitting: "{task?.title}" ({task?.estimate}m)
          </DialogTitle>
        </DialogHeader>

        <div className="py-5 space-y-5">
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Proposed Steps:</h4>
            {subtasks.map((subtask, index) => (
              <div key={subtask.id} className="flex items-center gap-3 py-2">
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
                />
                <input
                  type="number"
                  value={subtask.estimate}
                  onChange={(e) => updateSubtask(subtask.id, { estimate: Number.parseInt(e.target.value) || 0 })}
                  className="w-12 py-1.5 text-sm text-center font-mono text-slate-200 bg-transparent border-b border-white/10 focus:border-cyan-500/50 focus:outline-none transition-colors"
                />
                <span className="text-xs text-slate-500">m</span>
                <button
                  onClick={() => removeSubtask(subtask.id)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}

            <button
              onClick={addSubtask}
              className="flex items-center gap-2 px-1 py-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              <span>Add Step</span>
            </button>
          </div>

          <div className="relative px-4 py-3 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
            {/* Progress bar at bottom */}
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{ width: `${Math.min((totalTime / targetTime) * 100, 100)}%` }}
            />
            <span className="text-sm text-slate-400">
              Total:{" "}
              <span
                className={isMatch ? "text-cyan-400 font-medium font-mono" : "text-amber-400 font-medium font-mono"}
              >
                {totalTime}m / {targetTime}m
              </span>
              {isMatch && <span className="ml-2 text-xs text-slate-500">(Perfect Match)</span>}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="save-pattern"
              checked={savePattern}
              onCheckedChange={(checked) => setSavePattern(checked as boolean)}
              className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
            />
            <label htmlFor="save-pattern" className="text-sm text-slate-400 cursor-pointer">
              Save as pattern for future tasks?
            </label>
          </div>
        </div>

        <DialogFooter className="border-t border-white/10 pt-4 gap-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-slate-200 hover:bg-white/5">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 text-slate-300 hover:bg-white/5 bg-transparent"
          >
            Edit Manual
          </Button>
          <Button
            onClick={() => task && onApply(task.id, subtasks)}
            className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-slate-900 font-medium"
          >
            Approve & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
