"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; };

export function ChatThread({ messages, onNewChat }: { messages: ChatMessage[]; onNewChat: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Invisible Blurred Header */}
      <header className="sticky top-0 z-40 w-full h-20 flex items-center justify-between px-8 backdrop-blur-lg bg-transparent">
        <div className="w-6 h-6" /> {/* Spacer for menu alignment */}
        <span className="text-[11px] font-serif uppercase tracking-[0.2em] text-[#6A6965] opacity-50">Архив данных</span>
        <button onClick={onNewChat} className="p-1 active:scale-90 transition-transform opacity-40 hover:opacity-100">
          <img src="/icons/newchat.png" alt="New" className="w-6 h-6 invert" />
        </button>
      </header>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar px-8 py-4 space-y-12">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
            {msg.role === 'assistant' && (
              <img src="/icons/logo.gif" alt="AI" className="w-6 h-6 mb-4 opacity-80" />
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[90%] font-serif text-[17px] leading-relaxed ${
                msg.role === 'user' ? 'text-[#F2F1ED] text-right' : 'text-[#C5C4C0]'
              }`}
            >
              {msg.content}
            </motion.div>

            {msg.role === 'assistant' && (
              <div className="flex items-center gap-6 mt-6 opacity-30">
                <button className="hover:opacity-100 transition-opacity"><img src="/icons/like.png" className="w-4 h-4 invert" /></button>
                <button className="hover:opacity-100 transition-opacity"><img src="/icons/dislike.png" className="w-4 h-4 invert" /></button>
                <button className="hover:opacity-100 transition-opacity"><img src="/icons/redo.png" className="w-4 h-4 invert" /></button>
              </div>
            )}
          </div>
        ))}
        <div className="h-10" />
      </div>
    </div>
  );
}
