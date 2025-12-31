"use client"

import { useState, useCallback, useEffect } from "react"
import type { Task, ProposedSubtask, CompletedTask, Project } from "@/lib/types"
import { buildContextString } from "@/lib/context-utils"
import { initialTasks } from "@/lib/mock-data"
// import { supabase } from "@/lib/supabaseClient" // Not needed in client anymore for projects
import { Sidebar } from "@/components/sidebar"
import { MainStage } from "@/components/main-stage"
import { SplitModal } from "@/components/split-modal"
import { FocusMode } from "@/components/focus-mode"
import { CompletedPanel } from "@/components/completed-panel"

function toggleTaskExpansion(task: Task, targetId: string): Task {
  if (task.id === targetId) {
    return { ...task, isExpanded: !task.isExpanded }
  }
  return {
    ...task,
    children: task.children.map((child) => toggleTaskExpansion(child, targetId)),
  }
}

function applySubtasks(task: Task, targetId: string, subtasks: ProposedSubtask[]): Task {
  if (task.id === targetId) {
    const newChildren = subtasks
      .filter((s) => s.selected)
      .map((s, i) => ({
        id: `${task.id}-${s.id}`,
        title: s.title,
        estimate: s.estimate,
        depth: task.depth + 1,
        children: [],
        isExpanded: false,
      }))
    return { ...task, children: newChildren, isExpanded: true }
  }
  return {
    ...task,
    children: task.children.map((child) => applySubtasks(child, targetId, subtasks)),
  }
}

function findTaskWithParent(
  task: Task,
  targetId: string,
  parent: Task | null = null,
): { task: Task; parent: Task | null } | null {
  if (task.id === targetId) {
    return { task, parent }
  }
  for (const child of task.children) {
    const result = findTaskWithParent(child, targetId, task)
    if (result) return result
  }
  return null
}

function removeTask(task: Task, targetId: string): Task {
  return {
    ...task,
    children: task.children.filter((child) => child.id !== targetId).map((child) => removeTask(child, targetId)),
  }
}

function findNextTask(rootTask: Task, currentTaskId: string): Task | null {
  // Collect all leaf tasks in order
  const leafTasks: Task[] = []

  function collectLeaves(task: Task) {
    if (task.children.length === 0) {
      leafTasks.push(task)
    } else {
      for (const child of task.children) {
        collectLeaves(child)
      }
    }
  }

  collectLeaves(rootTask)

  // Find current task index and return next
  const currentIndex = leafTasks.findIndex((t) => t.id === currentTaskId)
  if (currentIndex !== -1 && currentIndex < leafTasks.length - 1) {
    return leafTasks[currentIndex + 1]
  }
  return null
}

function hasAnyTasks(task: Task): boolean {
  if (task.children.length === 0) return true
  return task.children.some((child) => hasAnyTasks(child))
}

function findParentOf(rootTask: Task, targetId: string, parent: Task | null = null): Task | null {
  if (rootTask.id === targetId) {
    return parent
  }
  for (const child of rootTask.children) {
    const result = findParentOf(child, targetId, rootTask)
    if (result !== undefined) return result
  }
  return null
}

// ... (previous imports)
import { CreateProjectView } from "@/components/create-project-view"
import { TaskModal } from "@/components/task-modal"

// ... (helper functions - keep them as they are, no changes needed to them)

// --- HELPER: Convert DB "Flat Rows" to UI "Tree" ---
function buildTaskTree(flatTasks: any[], rootTitle: string): Task {
  // 1. Create a map for quick lookups
  const taskMap: Record<string, Task> = {}

  // 2. Initialize all tasks with empty children
  flatTasks.forEach(t => {
    taskMap[t.id] = {
      id: String(t.id),
      title: t.title,
      estimate: t.estimate,
      depth: 0, // Will calculate later
      children: [],
      isExpanded: true // Default to expanded for now
    }
  })

  // 3. Create a fake "Root" task to hold the top-level items
  const root: Task = {
    id: "root",
    title: rootTitle,
    estimate: 0,
    depth: 0,
    children: []
  }

  // 4. Assemble the tree
  flatTasks.forEach(t => {
    if (t.parent_id && taskMap[t.parent_id]) {
      taskMap[t.parent_id].children.push(taskMap[t.id])
    } else {
      root.children.push(taskMap[t.id])
    }
  })

  // 5. Calculate depths recursively (optional but good for UI)
  const calcDepth = (node: Task, depth: number) => {
    node.depth = depth
    node.children.forEach(c => calcDepth(c, depth + 1))
  }
  calcDepth(root, -1) // Root is -1 so children start at 0

  return root
}

export default function FractalFocus() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task>({ id: "root", title: "Loading...", estimate: 0, depth: 0, children: [] })
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [splitTask, setSplitTask] = useState<Task | null>(null)
  const [splitContext, setSplitContext] = useState<string>("") // Context for AI
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([])
  const [isCompletedPanelOpen, setIsCompletedPanelOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'TREE' | 'FOCUS' | 'CREATE'>('TREE')
  const [fastDeleteMode, setFastDeleteMode] = useState(false)

  // --- NEW STATE FOR ADD/EDIT MODAL ---
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskModalMode, setTaskModalMode] = useState<"add" | "edit">("add")
  const [selectedTaskNode, setSelectedTaskNode] = useState<Task | null>(null) // The task being acted upon
  // ------------------------------------

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects')
        const data = await res.json()

        if (Array.isArray(data)) {
          // Normalize IDs to strings to prevent type mismatch errors
          const normalizedProjects = data.map((p: any) => ({ ...p, id: String(p.id) }))
          setProjects(normalizedProjects)

          // Select the first project automatically if none selected
          if (normalizedProjects.length > 0 && !activeProjectId) {
            setActiveProjectId(String(normalizedProjects[0].id))
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
    }

    fetchProjects()
  }, []) // Empty dependency array = run once

  // 3. LISTEN for project changes to clear/load tasks
  useEffect(() => {
    if (!activeProjectId) return

    // Find the current project's name
    const currentProject = projects.find(p => String(p.id) === activeProjectId)
    const rootName = currentProject ? currentProject.name : "Project Root"

    const fetchTasks = async () => {
      // Clear old data while loading
      setTasks(prev => ({ ...prev, id: "root", children: [], title: rootName }))

      try {
        const res = await fetch(`/api/tasks?projectId=${activeProjectId}`)
        const flatData = await res.json()

        if (Array.isArray(flatData)) {
          const treeStructure = buildTaskTree(flatData, rootName)
          setTasks(treeStructure)
        }
      } catch (error) {
        console.error("Task fetch error:", error)
      }
    }

    fetchTasks()
  }, [activeProjectId, projects])

  const handleProjectSelect = useCallback((id: string) => {
    // Force ID to string to be safe
    setActiveProjectId(String(id))
    setViewMode('TREE') // Switch back to tree view if they were in Create mode
  }, [])

  const handleToggle = useCallback((id: string) => {
    setTasks((prev) => toggleTaskExpansion(prev, id))
  }, [])

  const handleSplit = useCallback((task: Task) => {
    // Generate context string for AI
    const context = buildContextString(tasks, task.id)
    setSplitContext(context)
    setSplitTask(task)
    setIsModalOpen(true)
  }, [tasks])

  const handleApply = useCallback(async (taskId: string, subtasks: ProposedSubtask[]) => {
    if (!activeProjectId) return

    // 1. Filter for selected subtasks
    const selectedSubtasks = subtasks.filter(s => s.selected)

    // 2. Save each to DB
    for (const subtask of selectedSubtasks) {
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: subtask.title,
            estimate: subtask.estimate,
            projectId: activeProjectId,
            parentId: taskId === 'root' ? null : taskId // Handle root splitting
          })
        })
      } catch (error) {
        console.error("Failed to create subtask:", error)
      }
    }

    // 3. Re-fetch to update UI with real IDs
    try {
      const res = await fetch(`/api/tasks?projectId=${activeProjectId}`)
      const flatData = await res.json()

      const currentProject = projects.find(p => String(p.id) === activeProjectId)
      const rootName = currentProject ? currentProject.name : "Project Root"

      if (Array.isArray(flatData)) {
        const newTree = buildTaskTree(flatData, rootName)
        setTasks(newTree)

        // AUTO-ZOOM: If we just split the focused task, drill down to the first child
        if (viewMode === 'FOCUS' && focusedTaskId === taskId) {
          // We need to find the node in the NEW tree because it has the new children
          const nodeData = findTaskWithParent(newTree, taskId)
          if (nodeData && nodeData.task.children.length > 0) {
            setFocusedTaskId(nodeData.task.children[0].id)
          }
        }
      }
    } catch (error) {
      console.error("Refetch error:", error)
    }

    setIsModalOpen(false)
    setSplitTask(null)
  }, [activeProjectId, viewMode, focusedTaskId, projects])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSplitTask(null)
  }, [])

  // 1. OPEN ADD MODAL
  const handleManualAdd = useCallback((parentTask: Task) => {
    setSelectedTaskNode(parentTask)
    setTaskModalMode("add")
    setTaskModalOpen(true)
  }, [])

  // 2. OPEN EDIT MODAL
  const handleEdit = useCallback((task: Task) => {
    setSelectedTaskNode(task)
    setTaskModalMode("edit")
    setTaskModalOpen(true)
  }, [])

  // 3. SAVE FUNCTION (Called by Modal)
  const handleTaskModalConfirm = useCallback(async (title: string, estimate: number) => {
    if (!activeProjectId || !selectedTaskNode) return

    try {
      if (taskModalMode === 'add') {
        // CREATE NEW
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            estimate,
            projectId: activeProjectId,
            parentId: selectedTaskNode.id === 'root' ? null : selectedTaskNode.id
          })
        })
      } else {
        // EDIT EXISTING
        await fetch(`/api/tasks/${selectedTaskNode.id}`, { // This calls the new route
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, estimate })
        })
      }

      // REFRESH DATA
      const res = await fetch(`/api/tasks?projectId=${activeProjectId}`)
      const flatData = await res.json()
      const currentProject = projects.find(p => String(p.id) === activeProjectId)
      const rootName = currentProject ? currentProject.name : "Project Root"

      if (Array.isArray(flatData)) {
        setTasks(buildTaskTree(flatData, rootName))
      }
    } catch (error) {
      console.error("Task operation failed:", error)
    }
  }, [activeProjectId, selectedTaskNode, taskModalMode, projects])

  // 4. DELETE TASK
  const handleDelete = useCallback(async (task: Task) => {
    if (!activeProjectId) return

    // Safety check: Native confirm to prevent accidental deletion of huge trees
    // Bypass if Fast Delete is enabled
    if (!fastDeleteMode) {
      if (!confirm(`Are you sure you want to delete "${task.title}"?`)) return
    }

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      })

      // Refresh Data
      const res = await fetch(`/api/tasks?projectId=${activeProjectId}`)
      const flatData = await res.json()
      const currentProject = projects.find(p => String(p.id) === activeProjectId)
      const rootName = currentProject ? currentProject.name : "Project Root"

      if (Array.isArray(flatData)) {
        setTasks(buildTaskTree(flatData, rootName))
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }, [activeProjectId, projects, fastDeleteMode])


  const handleFocus = useCallback((task: Task) => {
    setFocusedTaskId(task.id)
    setViewMode('FOCUS')
  }, [])

  const handleExitFocus = useCallback(() => {
    setFocusedTaskId(null)
    setViewMode('TREE')
  }, [])

  const handleComplete = useCallback(
    (taskId: string) => {
      const findTask = (task: Task, id: string): Task | null => {
        if (task.id === id) return task
        for (const child of task.children) {
          const found = findTask(child, id)
          if (found) return found
        }
        return null
      }

      const taskToComplete = findTask(tasks, taskId)
      const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0]

      if (taskToComplete) {
        setCompletedTasks((prev) => [
          {
            id: taskToComplete.id,
            title: taskToComplete.title,
            estimate: taskToComplete.estimate,
            completedAt: new Date(),
            projectName: activeProject.name,
          },
          ...prev,
        ])
      }

      setTasks((prev) => removeTask(prev, taskId))
    },
    [tasks, activeProjectId],
  )

  const handleAdvanceToNext = useCallback(
    (currentTaskId: string): Task | null => {
      const nextTask = findNextTask(tasks, currentTaskId)
      if (nextTask) {
        setFocusedTaskId(nextTask.id)
        return nextTask
      }
      return null
    },
    [tasks],
  )

  const handleCreateProject = useCallback(async (title: string, context: string, useAI: boolean) => {
    console.log("Creating project:", { title, context, useAI })

    const newProject = {
      name: title,
      context: context,
      mode: "creative",
      emoji: "🆕"
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      })
      const data = await res.json()

      if (res.ok && data) {
        setProjects(prev => [data as Project, ...prev])
        setActiveProjectId(data.id)
        setViewMode('TREE')
      } else {
        console.error("Error creating project:", data.error)
        setViewMode('TREE')
      }
    } catch (error) {
      console.error("Error creating project:", error)
      setViewMode('TREE')
    }
  }, [])

  const hasMoreTasks = focusedTaskId ? findNextTask(tasks, focusedTaskId) !== null : false

  const focusedData = focusedTaskId ? findTaskWithParent(tasks, focusedTaskId) : null
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0]

  if (viewMode === 'CREATE') {
    return (
      <CreateProjectView
        onCancel={() => setViewMode('TREE')}
        onCreate={handleCreateProject}
      />
    )
  }

  // Handle Focus Mode (keeping consistent with previous logic, but checking viewMode or focusedTaskId)
  if (focusedData && viewMode === 'FOCUS') {
    return (
      <>
        <FocusMode
          task={focusedData.task}
          parentTask={focusedData.parent}
          project={activeProject}
          onComplete={handleComplete}
          onSplit={handleSplit}
          onExit={handleExitFocus}
          onAdvanceToNext={handleAdvanceToNext}
          hasMoreTasks={hasMoreTasks}
        />
        <SplitModal task={splitTask} isOpen={isModalOpen} onClose={handleCloseModal} onApply={handleApply} />
      </>
    )
  }

  // Also handle if focusedTaskId is set but viewMode might be TREE (legacy/defensive)
  if (focusedData) {
    // If we have focused data but viewMode wasn't set to FOCUS, setting it here (useEffect would be better but this works for render)
    // However, let's stick to the previous conditional logic which was implicitly "if focusedData exists"
  }

  // Re-implementing the original render logic for Focus Mode to be safe, but using the new viewMode guard as primary if desired.
  // The original code was: if (focusedData) { return <FocusMode ... /> }
  // I will keep that behavior for compatibility, but Create View takes precedence.

  if (focusedData) {
    return (
      <>
        <FocusMode
          task={focusedData.task}
          parentTask={focusedData.parent}
          project={activeProject}
          onComplete={handleComplete}
          onSplit={handleSplit}
          onExit={handleExitFocus}
          onAdvanceToNext={handleAdvanceToNext}
          hasMoreTasks={hasMoreTasks}
        />
        <SplitModal task={splitTask} context={splitContext} isOpen={isModalOpen} onClose={handleCloseModal} onApply={handleApply} />
      </>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId || ""} // Pass empty string if null
        onProjectSelect={handleProjectSelect} // Use our new safe handler
        completedCount={completedTasks.length}
        onOpenCompleted={() => setIsCompletedPanelOpen(true)}
        onNewProject={() => setViewMode('CREATE')}
        fastMode={fastDeleteMode}
        onToggleFastMode={() => setFastDeleteMode(prev => !prev)}
      />
      <MainStage
        tasks={tasks}
        onToggle={handleToggle}
        onSplit={handleSplit}
        onFocus={handleFocus}
        onAdd={handleManualAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <SplitModal task={splitTask} context={splitContext} isOpen={isModalOpen} onClose={handleCloseModal} onApply={handleApply} />
      <CompletedPanel
        completedTasks={completedTasks}
        isOpen={isCompletedPanelOpen}
        onClose={() => setIsCompletedPanelOpen(false)}
      />

      {/* NEW TASK MODAL */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onConfirm={handleTaskModalConfirm}
        mode={taskModalMode}
        initialData={taskModalMode === 'edit' && selectedTaskNode ? {
          title: selectedTaskNode.title,
          estimate: selectedTaskNode.estimate
        } : undefined}
      />
    </div>
  )
}
