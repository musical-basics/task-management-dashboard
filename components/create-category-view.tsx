"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"

interface CreateCategoryViewProps {
    onCancel: () => void
    onCreate: (name: string) => void
}

export function CreateCategoryView({ onCancel, onCreate }: CreateCategoryViewProps) {
    const [name, setName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsSubmitting(true)

        // Simulate tiny delay for UX (loading state visibility)
        await new Promise(resolve => setTimeout(resolve, 300))

        onCreate(name)
    }

    return (
        <div className="flex-1 h-screen relative bg-[#0B1120] flex items-center justify-center overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0B1120] to-[#0B1120] z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl mx-4 z-10"
            >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl p-8 md:p-12">
                    {/* Close Button */}
                    <button
                        onClick={onCancel}
                        className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-sm font-medium text-indigo-500 uppercase tracking-[0.2em] mb-2">Create New Category</h2>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="e.g. Work, Personal, Hobby"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-transparent text-4xl font-bold text-center text-white placeholder:text-slate-700 border-b-2 border-slate-800 focus:border-indigo-500/50 focus:outline-none py-4 transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                className="flex-1 text-slate-400 hover:text-white hover:bg-white/5 py-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!name.trim() || isSubmitting}
                                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 shadow-[0_0_20px_-5px_var(--color-indigo-500)] disabled:opacity-50 disabled:shadow-none transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Category"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
