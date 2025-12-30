"use client"

import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
// Add Trash2 to imports
import { ChevronRight, AlertTriangle, Sparkles, Play, Plus, Pencil, Trash2 } from "lucide-react"
import { useMemo } from "react"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onSplit: (task: Task) => void
  onFocus: (task: Task) => void
  onAdd: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void // <--- NEW PROP
}

function calculateChildrenSum(task: Task): number {
  if (task.children.length === 0) return 0
  return task.children.reduce((sum, child) => sum + child.estimate, 0)
}

export function TaskItem({ task, onToggle, onSplit, onFocus, onAdd, onEdit, onDelete }: TaskItemProps) {
  const hasChildren = task.children.length > 0
  const childrenSum = useMemo(() => calculateChildrenSum(task), [task])
  const isOverEstimate = hasChildren && childrenSum > task.estimate

  const depthStyles: Record<number, string> = {
    0: "text-2xl font-bold text-slate-100 tracking-tight",
    1: "text-lg font-semibold text-slate-100 tracking-tight",
    2: "text-base text-slate-300",
    3: "text-sm text-slate-400",
  }

  const getDepthStyle = (depth: number) => {
    if (depth >= 4) return "text-xs text-slate-500"
    return depthStyles[depth]
  }

  const indentPx = task.depth * 24

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 py-2.5 px-3 rounded-lg transition-all",
          "hover:bg-white/5 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]",
          task.depth === 1 && "border-b border-white/5 pb-3 mb-2",
        )}
        style={{ paddingLeft: `${12 + indentPx}px` }}
      >
        {hasChildren ? (
          <button onClick={() => onToggle(task.id)} className="p-0.5 hover:bg-white/10 rounded transition-colors">
            <ChevronRight
              className={cn("h-4 w-4 text-slate-500 transition-transform", task.isExpanded && "rotate-90")}
              strokeWidth={1.5}
            />
          </button>
        ) : (
          <div className="w-5 h-5 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
          </div>
        )}

        <span className={cn("flex-1 cursor-default", getDepthStyle(task.depth))}>{task.title}</span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

          {/* EDIT */}
          <button onClick={() => onEdit(task)} className="p-1.5 text-slate-500 hover:text-slate-300 transition-all" title="Rename">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>

          {/* ADD */}
          <button onClick={() => onAdd(task)} className="p-1.5 text-emerald-500 hover:text-emerald-400 transition-all" title="Add subtask">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* SPLIT */}
          <button onClick={() => onSplit(task)} className="p-1.5 text-cyan-500 hover:text-cyan-400 hover:animate-pulse-glow transition-all" title="AI Split">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>

          {/* DELETE (NEW) */}
          <button onClick={() => onDelete(task)} className="p-1.5 text-slate-600 hover:text-red-400 transition-all" title="Delete">
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>

          {/* FOCUS */}
          {!hasChildren && (
            <button onClick={() => onFocus(task)} className="p-1.5 text-amber-500 hover:text-amber-400 transition-all" title="Focus">
              <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 ml-2">
          {hasChildren && (
            <span className={cn("text-xs font-mono", isOverEstimate ? "text-amber-400" : "text-slate-500")}>
              {isOverEstimate && <AlertTriangle className="inline h-3 w-3 mr-1" strokeWidth={1.5} />}
              {task.estimate}m{isOverEstimate && <span className="text-slate-500 ml-1">[{childrenSum}m]</span>}
            </span>
          )}
          {!hasChildren && <span className="text-xs font-mono text-slate-500">{task.estimate}m</span>}
        </div>
      </div>

      {hasChildren && task.isExpanded && (
        <div>
          {task.children.map((child) => (
            <TaskItem
              key={child.id}
              task={child}
              onToggle={onToggle}
              onSplit={onSplit}
              onFocus={onFocus}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete} // <--- Pass down
            />
          ))}
        </div>
      )}
    </div>
  )
}
