"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Task } from "@/lib/types"

interface TaskModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (title: string, estimate: number) => void
    mode: "add" | "edit"
    initialData?: { title: string; estimate: number }
}

export function TaskModal({ isOpen, onClose, onConfirm, mode, initialData }: TaskModalProps) {
    const [title, setTitle] = useState("")
    const [estimate, setEstimate] = useState(15)

    // Reset or pre-fill form when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || "")
            setEstimate(initialData?.estimate || 15)
        }
    }, [isOpen, initialData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return
        onConfirm(title, estimate)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 text-slate-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium">
                        {mode === "add" ? "New Task" : "Edit Task"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className="bg-white/5 border-white/10 focus:border-cyan-500/50 text-lg py-6"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Estimate (Minutes)</label>
                        <Input
                            type="number"
                            value={estimate}
                            onChange={(e) => setEstimate(Number(e.target.value))}
                            className="bg-white/5 border-white/10 focus:border-cyan-500/50 font-mono"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-white/10 text-slate-400 hover:text-white">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0"
                        >
                            {mode === "add" ? "Create Task" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
