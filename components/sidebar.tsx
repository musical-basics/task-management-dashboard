"use client"

import type { Project, Category } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CheckCircle2, Plus, Trash2, Pencil, FolderPlus } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface SidebarProps {
  projects: Project[]
  activeProjectId: string
  onProjectSelect: (id: string) => void
  completedCount?: number
  onOpenCompleted?: () => void
  onNewProject?: () => void
  fastMode: boolean
  onToggleFastMode: () => void
  onEditProject: (id: string, newName: string) => void

  // CATEGORY PROPS
  categories?: Category[]
  onBatchUpdate?: (updates: { projects?: any[]; categories?: any[] }) => void
  onAddCategory?: () => void
  onEditCategory?: (id: string, newName: string) => void
  onDeleteCategory?: (id: string) => void
  onDeleteProject?: (id: string) => void
}

export function Sidebar({
  projects,
  activeProjectId,
  onProjectSelect,
  completedCount = 0,
  onOpenCompleted,
  onNewProject,
  fastMode,
  onToggleFastMode,
  onEditProject,
  categories = [],
  onBatchUpdate,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onDeleteProject,
}: SidebarProps) {

  // Calculate grouped projects
  const projectsByCategory: Record<string, Project[]> = {}
  categories.forEach(cat => {
    projectsByCategory[cat.id] = projects
      .filter(p => p.category_id === cat.id)
      .sort((a, b) => a.sort_order - b.sort_order)
  })

  // Also catch uncategorized projects
  const uncategorized = projects.filter(p => !p.category_id)
  if (uncategorized.length > 0) {
    projectsByCategory['uncategorized'] = uncategorized
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination || !onBatchUpdate) return

    const { source, destination, type } = result

    // 1. Reordering Categories
    if (type === 'CATEGORY') {
      const newCategories = Array.from(categories)
      const [moved] = newCategories.splice(source.index, 1)
      newCategories.splice(destination.index, 0, moved)

      const updates = newCategories.map((c, index) => ({
        id: c.id,
        sort_order: index
      }))

      onBatchUpdate({ categories: updates })
      return
    }

    // 2. Reordering Projects
    const sourceCategory = source.droppableId
    const destCategory = destination.droppableId

    // Copy the lists
    const sourceList = projects.filter(p => (p.category_id || 'uncategorized') === sourceCategory).sort((a, b) => a.sort_order - b.sort_order)
    let destList = sourceCategory === destCategory
      ? sourceList
      : projects.filter(p => (p.category_id || 'uncategorized') === destCategory).sort((a, b) => a.sort_order - b.sort_order)

    // Remove from source
    const [movedProject] = sourceList.splice(source.index, 1)

    // Update category if moved
    const newCategoryId = destCategory === 'uncategorized' ? null : destCategory
    const projectToUpdate = { ...movedProject, category_id: newCategoryId }

    // Add to destination
    if (sourceCategory === destCategory) {
      sourceList.splice(destination.index, 0, projectToUpdate)

      const updates = sourceList.map((p, index) => ({
        id: p.id,
        sort_order: index,
        category_id: p.category_id
      }))
      onBatchUpdate({ projects: updates })
    } else {
      destList.splice(destination.index, 0, projectToUpdate)

      const sourceUpdates = sourceList.map((p, index) => ({
        id: p.id,
        sort_order: index,
        category_id: p.category_id
      }))
      const destUpdates = destList.map((p, index) => ({
        id: p.id,
        sort_order: index,
        category_id: p.category_id
      }))

      onBatchUpdate({ projects: [...sourceUpdates, ...destUpdates] })
    }
  }

  // --- Handlers for Editing Names ---

  const handleEditProjectClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    const newName = prompt("Enter new project name:", project.name)
    if (newName && newName.trim() !== "") {
      onEditProject(project.id, newName.trim())
    }
  }

  const handleEditCategoryClick = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation() // Prevent drag start
    if (!onEditCategory) return
    const newName = prompt("Enter new category name:", category.name)
    if (newName && newName.trim() !== "") {
      onEditCategory(category.id, newName.trim())
    }
  }

  const handleDeleteCategoryClick = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation()
    if (!onDeleteCategory) return
    if (confirm("Delete this category? Projects inside will become uncategorized.")) {
      onDeleteCategory(categoryId)
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <aside className="w-[260px] bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen">
        <div className="p-5 border-b border-white/5">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">FractalFocus</h1>
          <p className="text-xs text-slate-400 mt-1 tracking-wide">Current Focus</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Droppable droppableId="all-categories" type="CATEGORY">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                {categories.map((category, index) => (
                  <Draggable key={category.id} draggableId={category.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} className="group/cat relative">
                        {/* CATEGORY HEADER */}
                        <div className="flex items-center justify-between mb-2 px-3 group/header">
                          <h3
                            {...provided.dragHandleProps}
                            className="text-[11px] font-medium text-slate-500 uppercase tracking-widest cursor-grab active:cursor-grabbing hover:text-slate-300 transition-colors"
                          >
                            {category.name}
                          </h3>

                          {/* CATEGORY ACTIONS (Edit/Delete) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleEditCategoryClick(e, category)}
                              className="p-1 text-slate-600 hover:text-cyan-400 transition-colors"
                              title="Rename Category"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteCategoryClick(e, category.id)}
                              className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* PROJECTS LIST */}
                        <Droppable droppableId={category.id} type="PROJECT">
                          {(provided) => (
                            <ul
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-0.5 min-h-[10px]"
                            >
                              {(projectsByCategory[category.id] || []).map((project, index) => (
                                <Draggable key={project.id} draggableId={project.id} index={index}>
                                  {(provided, snapshot) => (
                                    <li
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="group relative"
                                    >
                                      <div
                                        onClick={() => onProjectSelect(project.id)}
                                        className={cn(
                                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left pr-8 cursor-pointer select-none",
                                          activeProjectId === project.id
                                            ? "bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-400 text-slate-100"
                                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                                          snapshot.isDragging && "bg-slate-800 shadow-lg ring-1 ring-white/10 opacity-90 z-50"
                                        )}
                                      >
                                        <span className="text-base min-w-[20px]">{project.emoji}</span>
                                        <span className="font-medium truncate flex-1">{project.name}</span>
                                      </div>

                                      {/* Project Actions */}
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10 gap-1">
                                        <button
                                          onClick={(e) => handleEditProjectClick(e, project)}
                                          className="p-1 text-slate-500 hover:text-cyan-400"
                                          title="Rename Project"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            if (onDeleteProject && confirm(`Delete project "${project.name}" and all its tasks?`)) {
                                              onDeleteProject(project.id)
                                            }
                                          }}
                                          className="p-1 text-slate-500 hover:text-red-400"
                                          title="Delete Project"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </li>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </ul>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* UNCATEGORIZED PROJECTS */}
          {uncategorized.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2 px-3">
                <h3 className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">
                  Uncategorized
                </h3>
              </div>
              <Droppable droppableId="uncategorized" type="PROJECT">
                {(provided) => (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-0.5 min-h-[10px]"
                  >
                    {uncategorized.map((project, index) => (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="group relative"
                          >
                            <div
                              onClick={() => onProjectSelect(project.id)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left pr-8 cursor-pointer select-none",
                                activeProjectId === project.id
                                  ? "bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-400 text-slate-100"
                                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                                snapshot.isDragging && "bg-slate-800 shadow-lg ring-1 ring-white/10 opacity-90 z-50"
                              )}
                            >
                              <span className="text-base min-w-[20px]">{project.emoji}</span>
                              <span className="font-medium truncate flex-1">{project.name}</span>
                            </div>

                            {/* Project Actions */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10 gap-1">
                              <button
                                onClick={(e) => handleEditProjectClick(e, project)}
                                className="p-1 text-slate-500 hover:text-cyan-400"
                                title="Rename Project"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (onDeleteProject && confirm(`Delete project "${project.name}" and all its tasks?`)) {
                                    onDeleteProject(project.id)
                                  }
                                }}
                                className="p-1 text-slate-500 hover:text-red-400"
                                title="Delete Project"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
          )}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="p-4 border-t border-white/5 space-y-2 bg-slate-900/80 backdrop-blur-md">
          {/* Completed Button */}
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

          {/* New Category Button */}
          <button
            onClick={onAddCategory}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
          >
            <FolderPlus className="h-4 w-4" strokeWidth={1.5} />
            <span>New Category</span>
          </button>

          {/* New Project Button */}
          <button
            onClick={onNewProject}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            <span>New Project</span>
          </button>

          {/* Fast Mode Toggle */}
          <button
            onClick={onToggleFastMode}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-colors rounded-lg",
              fastMode
                ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                : "text-slate-400 hover:text-red-400 hover:bg-white/5"
            )}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            <span>Fast Mode: {fastMode ? "ON" : "OFF"}</span>
          </button>
        </div>
      </aside>
    </DragDropContext>
  )
}
