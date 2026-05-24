"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, User } from "lucide-react"
import { useTelemetry } from "@/lib/telemetry-store"

const suggestedPrompts = [
  "What caused this outage?",
  "Which APIs were affected?",
  "How can we prevent this?",
  "What triggered the latency spike?",
  "What recovery actions were executed?"
]

export function AskTrinetraPanel({ showChips = true }: { showChips?: boolean }) {
  const { chatMessages, sendMessage } = useTelemetry()
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, isSending])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || isSending) return
    
    setInput("")
    setIsSending(true)
    await sendMessage(text)
    setIsSending(false)
  }

  return (
    <div className="h-full relative flex flex-col overflow-hidden w-full bg-transparent">
      
      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-32 space-y-8 custom-scrollbar">
        {chatMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4 pt-10">
            <div className="w-12 h-12 rounded-full border border-white/[0.05] bg-white/[0.02] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-400 font-light">How can I help you resolve telemetry anomalies today?</p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {msg.role === "assistant" && (
              <div className="shrink-0 w-8 h-8 rounded-full border border-white/[0.05] bg-white text-black shadow-sm flex items-center justify-center mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            
            <div className={`flex flex-col gap-1.5 max-w-[85%] lg:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {msg.role === "assistant" && (
                <div className="text-[10px] text-zinc-500 font-mono pl-1 uppercase tracking-wider font-semibold">
                  SRE Autopilot
                </div>
              )}
              
              <div className={`px-5 py-3.5 rounded-2xl text-[13px] md:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-zinc-800 text-white rounded-tr-sm"
                  : "bg-[#09090B] border border-white/[0.03] text-zinc-300 rounded-tl-sm shadow-sm"
              }`}>
                {msg.isStreaming ? (
                  <div className="flex items-center gap-1.5 h-5 px-1">
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-light">{msg.content}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Skeletons */}
        {isSending && (
          <div className="flex gap-4 animate-in fade-in duration-300">
            <div className="shrink-0 w-8 h-8 rounded-full border border-white/[0.05] bg-zinc-900 text-zinc-600 flex items-center justify-center mt-1">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1.5 max-w-[85%] lg:max-w-[75%] w-full">
              <div className="text-[10px] text-zinc-600 font-mono pl-1 uppercase tracking-wider font-semibold">
                SRE Autopilot
              </div>
              <div className="px-5 py-4 rounded-2xl bg-[#09090B] border border-white/[0.03] rounded-tl-sm space-y-2 w-64 shadow-sm">
                <div className="h-2 bg-zinc-800 rounded w-full animate-pulse"></div>
                <div className="h-2 bg-zinc-800 rounded w-4/5 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={endOfMessagesRef} className="h-4" />
      </div>

      {/* Floating Input Area positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 bg-gradient-to-t from-[#050507] via-[#050507] to-transparent pt-12 flex flex-col items-center justify-end z-20 pointer-events-none">
        <div className="w-full max-w-2xl pointer-events-auto flex flex-col items-center">
          
          {/* Suggested Prompts Chips */}
          {showChips && chatMessages.length < 2 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {suggestedPrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  disabled={isSending}
                  onClick={() => handleSend(prompt)}
                  className="px-4 py-2 text-[11px] font-mono text-zinc-400 hover:text-white bg-black/60 backdrop-blur-sm border border-white/[0.05] hover:border-white/[0.1] rounded-full transition-all cursor-pointer shadow-sm disabled:opacity-30"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Floating Input Box */}
          <form 
            className="w-full relative flex items-center"
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <div className="absolute left-4 w-5 h-5 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-zinc-500" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              placeholder="Ask Trinetra autopilot..."
              className="w-full bg-zinc-900/60 backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.1] focus:border-white/[0.15] focus:bg-zinc-900/80 rounded-full pl-12 pr-12 py-3.5 text-sm font-sans font-light text-white placeholder:text-zinc-500 outline-none transition-all shadow-lg"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isSending}
              className="absolute right-2 top-1.5 bottom-1.5 w-9 h-9 rounded-full bg-white hover:bg-zinc-200 text-black border-0 disabled:opacity-20 disabled:bg-zinc-800 disabled:text-zinc-500 flex items-center justify-center cursor-pointer transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          
          <div className="mt-3 text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
            Autopilot can make mistakes. Verify critical actions.
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}} />
    </div>
  )
}
