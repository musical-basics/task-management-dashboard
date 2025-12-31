"use client"

import { useState, useEffect } from "react"
import type { Task, Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft, Timer, Check, Trophy, X } from "lucide-react"

interface FocusModeProps {
  task: Task
  parentTask: Task | null
  project: Project
  onComplete: (taskId: string) => void
  onSplit: (task: Task) => void
  onExit: () => void
  onAdvanceToNext: (currentTaskId: string) => Task | null
  hasMoreTasks: boolean
  onNavigateToTask?: (taskId: string) => void
}

type TransitionState = "idle" | "exiting" | "success" | "entering"

export function FocusMode({
  task,
  parentTask,
  project,
  onComplete,
  onSplit,
  onExit,
  onAdvanceToNext,
  hasMoreTasks,
  onNavigateToTask,
}: FocusModeProps) {
  const [transitionState, setTransitionState] = useState<TransitionState>("idle")
  const [displayedTask, setDisplayedTask] = useState(task)
  const [displayedParent, setDisplayedParent] = useState(parentTask)
  const [isProjectComplete, setIsProjectComplete] = useState(false)

  useEffect(() => {
    if (transitionState === "idle") {
      setDisplayedTask(task)
      setDisplayedParent(parentTask)
    }
  }, [task, parentTask, transitionState])

  const handleComplete = async () => {
    // Start exit animation
    setTransitionState("exiting")

    // Wait for exit animation
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Show success state
    setTransitionState("success")

    // Complete the task in parent state
    onComplete(displayedTask.id)

    // Wait to show checkmark
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Try to get next task
    const nextTask = onAdvanceToNext(displayedTask.id)

    if (nextTask) {
      // Update displayed task for entrance
      setDisplayedTask(nextTask)
      // Parent will be updated by the prop when component re-renders
      setTransitionState("entering")

      // Wait for entrance animation, then reset
      await new Promise((resolve) => setTimeout(resolve, 300))
      setTransitionState("idle")
    } else {
      // No more tasks - show project complete
      setIsProjectComplete(true)
    }
  }

  if (isProjectComplete) {
    return (
      <div className="fixed inset-0 bg-[#0B1120] flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.12)_0%,_transparent_70%)]" />

        <button
          onClick={onExit}
          className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <X className="h-6 w-6" strokeWidth={1.5} />
        </button>

        <div className="relative flex flex-col items-center text-center">
          {/* Trophy Icon */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(6,182,212,0.5)] animate-pulse">
            <Trophy className="h-16 w-16 text-slate-900" strokeWidth={1.5} />
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Project Complete!</h1>
          <p className="text-slate-400 text-lg mb-10">{project.name} has been finished.</p>

          <Button
            onClick={onExit}
            className="px-8 py-4 text-base font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#0B1120] flex items-center justify-center overflow-hidden z-[100]">
      {/* Radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.08)_0%,_transparent_70%)]" />

      <button
        onClick={onExit}
        disabled={transitionState !== "idle"}
        className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 disabled:opacity-50 z-30"
      >
        <X className="h-6 w-6" strokeWidth={1.5} />
      </button>

      <div
        className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 ${transitionState === "success" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.5)] animate-bounce">
          <Check className="h-12 w-12 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Glass card container with slide animations */}
      <div
        className={`relative w-full max-w-xl mx-4 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center transition-all duration-300 ${transitionState === "exiting"
            ? "opacity-0 -translate-x-16"
            : transitionState === "entering"
              ? "opacity-100 translate-x-0 animate-slide-in-right"
              : transitionState === "success"
                ? "opacity-0"
                : "opacity-100"
          }`}
      >
        {/* Level 1: Ultimate Parent (Project) */}
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Project: {project.name}</p>

        {/* Level 2: Immediate Context (Parent Task) */}
        {displayedParent && (
          <button
            onClick={() => onNavigateToTask?.(displayedParent.id)}
            className="text-sm text-cyan-400/80 mb-8 hover:text-cyan-300 hover:underline transition-all cursor-pointer"
          >
            <span className="mr-1">↳</span> In: {displayedParent.title}
          </button>
        )}

        {/* Level 3: The Task - HERO */}
        <h1 className="text-5xl font-bold text-white tracking-tight animate-pulse-glow">{displayedTask.title}</h1>

        {/* Level 4: The Time */}
        <p className="flex items-center gap-2 text-2xl font-mono text-slate-400 mt-4">
          <Timer className="h-5 w-5" strokeWidth={1.5} />
          {displayedTask.estimate}m estimated
        </p>

        {/* Action Bar */}
        <div className="flex flex-col items-center gap-4 mt-12 w-full">
          {/* Primary Row: Split + Complete */}
          <div className="flex items-center justify-center gap-4 w-full">
            {/* Split Button - Left */}
            <Button
              variant="ghost"
              onClick={() => onSplit(displayedTask)}
              disabled={transitionState !== "idle"}
              className="text-slate-300 hover:text-white hover:bg-white/5"
            >
              <Sparkles className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Split Task
            </Button>

            {/* Complete Button - Center, Huge */}
            <Button
              onClick={handleComplete}
              disabled={transitionState !== "idle"}
              className="px-10 py-6 text-lg font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all disabled:opacity-50"
            >
              Complete Task
            </Button>
          </div>

          {/* Tertiary: Escape Hatch */}
          <button
            onClick={onExit}
            disabled={transitionState !== "idle"}
            className="flex items-center gap-2 mt-4 text-sm text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            I'm Stuck / Switch Project
          </button>
        </div>
      </div>
    </div>
  )
}
