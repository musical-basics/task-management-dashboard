"use client"

import type { Project } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Zap, CheckCircle2 } from "lucide-react"

interface SidebarProps {
  projects: Project[]
  activeProjectId: string
  onProjectSelect: (id: string) => void
  completedCount?: number
  onOpenCompleted?: () => void
}

export function Sidebar({
  projects,
  activeProjectId,
  onProjectSelect,
  completedCount = 0,
  onOpenCompleted,
}: SidebarProps) {
  const groupedProjects = {
    creative: projects.filter((p) => p.mode === "creative"),
    technical: projects.filter((p) => p.mode === "technical"),
    admin: projects.filter((p) => p.mode === "admin"),
  }

  const modeLabels = {
    creative: "Creative",
    technical: "Technical",
    admin: "Admin",
  }

  return (
    <aside className="w-[260px] bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen">
      <div className="p-5 border-b border-white/5">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">FractalFocus</h1>
        <p className="text-xs text-slate-400 mt-1 tracking-wide">Current Focus</p>
      </div>

      <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
        {(Object.keys(groupedProjects) as Array<keyof typeof groupedProjects>).map((mode) => (
          <div key={mode}>
            <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-widest px-3 mb-2">
              {modeLabels[mode]}
            </h3>
            <ul className="space-y-0.5">
              {groupedProjects[mode].map((project) => (
                <li key={project.id}>
                  <button
                    onClick={() => onProjectSelect(project.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                      activeProjectId === project.id
                        ? "bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-400 text-slate-100"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                    )}
                  >
                    <span className="text-base">{project.emoji}</span>
                    <span className="font-medium">{project.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <button
          onClick={onOpenCompleted}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-white/5"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
            <span>Completed</span>
          </div>
          {completedCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
              {completedCount}
            </span>
          )}
        </button>
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5">
          <Zap className="h-4 w-4" strokeWidth={1.5} />
          <span>Quick Switch</span>
        </button>
      </div>
    </aside>
  )
}
