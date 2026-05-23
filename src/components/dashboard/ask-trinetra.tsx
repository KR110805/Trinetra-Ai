"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Terminal, Cpu, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    <Card className="h-full border border-white/[0.04] bg-[#09090B] shadow-[0_1px_3px_rgba(0,0,0,0.6)] relative flex flex-col overflow-hidden rounded-lg">
      
      <CardHeader className="pb-3 relative z-10 border-b border-white/[0.04] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-zinc-500" />
            <CardTitle className="text-[11px] font-semibold text-white uppercase tracking-wider font-mono">
              Ask Trinetra
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/[0.06] bg-white/[0.02] text-[8px] font-mono text-zinc-400 uppercase tracking-widest">
            SRE AGENT ONLINE
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 relative z-10 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-black/10">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-3.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`shrink-0 w-6 h-6 rounded flex items-center justify-center border text-[10px] font-mono font-bold transition-all ${
              msg.role === "assistant" 
                ? "bg-white border-transparent text-black shadow-sm" 
                : "bg-zinc-900 border-white/[0.04] text-zinc-300"
            }`}>
              {msg.role === "assistant" ? <Cpu className="w-3 h-3" /> : <User className="w-3 h-3" />}
            </div>
            
            <div className={`flex flex-col gap-1 max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-2 text-[8px] text-zinc-650 font-mono">
                {msg.role === "assistant" ? "TRINETRA" : "OPERATIONS"}
                <span>•</span>
                <span>{msg.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              <div className={`p-3 rounded text-[11px] font-mono leading-relaxed border ${
                msg.role === "user"
                  ? "bg-white/[0.02] border-white/[0.06] text-white rounded-tr-none"
                  : "bg-black/20 border-white/[0.02] text-zinc-300 rounded-tl-none"
              }`}>
                {msg.isStreaming ? (
                  <div className="flex items-center gap-1 h-3.5 px-0.5">
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Skeletons */}
        {isSending && (
          <div className="flex gap-3.5 animate-pulse">
            <div className="shrink-0 w-6 h-6 rounded bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-zinc-600">
              <Cpu className="w-3 h-3" />
            </div>
            <div className="flex flex-col gap-1.5 flex-1 max-w-[82%]">
              <div className="h-2 bg-zinc-950 rounded w-16"></div>
              <div className="p-3 rounded border border-white/[0.04] bg-zinc-950/40 space-y-1.5 w-64">
                <div className="h-2 bg-zinc-900 rounded w-full"></div>
                <div className="h-2 bg-zinc-900 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </CardContent>

      <CardFooter className="p-3.5 pt-0 shrink-0 relative z-10 border-t border-white/[0.04] bg-[#09090B] flex flex-col items-stretch gap-3">
        {/* Suggested Prompts Chips */}
        {showChips && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                disabled={isSending}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 text-[8px] font-mono text-zinc-500 hover:text-white bg-black hover:bg-white/[0.02] border border-white/[0.04] hover:border-zinc-800 rounded transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form 
          className="w-full relative flex items-center mt-3"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            placeholder="Query SRE AI agent..."
            className="w-full bg-black border border-white/[0.04] focus:border-white/[0.08] rounded pl-3.5 pr-11 py-2 text-[11px] font-mono text-white placeholder:text-zinc-650 outline-none transition-colors"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!input.trim() || isSending}
            className="absolute right-1 top-1 bottom-1 h-auto w-8 bg-white hover:bg-zinc-200 text-black border-0 disabled:opacity-20 rounded cursor-pointer transition-all"
          >
            <Send className="w-3 h-3" />
          </Button>
        </form>
      </CardFooter>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.08);
        }
      `}} />
    </Card>
  )
}
