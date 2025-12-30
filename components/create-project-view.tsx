"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, X } from "lucide-react"

interface CreateProjectViewProps {
  onCancel: () => void
  onCreate: (title: string, context: string, useAI: boolean) => void
}

export function CreateProjectView({ onCancel, onCreate }: CreateProjectViewProps) {
  const [title, setTitle] = useState("")
  const [context, setContext] = useState("")
  const [useAI, setUseAI] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    
    // Simulate initial delay if needed, but the parent handles the "architecting" state
    // We just pass the data up
    // Wait a tiny bit to show the button loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onCreate(title, context, useAI)
  }

  return (
    <div className="flex-1 h-screen relative bg-[#0B1120] flex items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0B1120] to-[#0B1120] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl mx-4 z-10"
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
                   <h2 className="text-sm font-medium text-cyan-500 uppercase tracking-[0.2em] mb-2">Initialize New Project</h2>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="e.g. Learn Spanish"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-4xl md:text-5xl font-bold text-center text-white placeholder:text-slate-700 border-b-2 border-slate-800 focus:border-cyan-500/50 focus:outline-none py-4 transition-all"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context" className="text-xs uppercase tracking-wider text-slate-400 font-medium ml-1">
                    Context / Constraints (Optional)
                  </Label>
                  <textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Budget is $500, deadline is Friday..."
                    className="w-full h-24 bg-slate-950/50 rounded-lg border border-white/5 p-4 text-slate-300 placeholder:text-slate-600 focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center justify-between bg-slate-800/30 rounded-xl p-4 border border-white/5">
                    <div className="space-y-1">
                      <Label htmlFor="ai-mode" className="text-white font-medium flex items-center gap-2">
                         <Sparkles className="w-4 h-4 text-amber-400" />
                         Auto-generate Phase 1 Milestones
                      </Label>
                      <p className="text-xs text-slate-400">The AI will break this into high-level phases immediately.</p>
                    </div>
                    <Switch 
                      id="ai-mode" 
                      checked={useAI}
                      onCheckedChange={setUseAI}
                    />
                 </div>

                 <div className="flex items-center gap-4">
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
                      disabled={!title.trim() || isSubmitting}
                      className="flex-[2] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-6 shadow-[0_0_20px_-5px_var(--color-cyan-500)] disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      {isSubmitting ? (
                        <>
                           <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                           Initializing...
                        </>
                      ) : (
                        "Launch Project"
                      )}
                    </Button>
                 </div>
              </div>
           </form>
        </div>
      </motion.div>
    </div>
  )
}
